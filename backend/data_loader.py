import sys
from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, List, Optional

# Base data directory
DATA_DIR = Path(__file__).resolve().parent.parent

class DataLoader:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataLoader, cls).__new__(cls)
            cls._instance.loaded = False
            cls._instance.data = {}
        return cls._instance

    def load_data(self):
        if self.loaded:
            return self.data
        
        print("Loading Olist CSV files into memory...")
        try:
            orders = pd.read_csv(DATA_DIR / "olist_orders_dataset.csv")
            order_items = pd.read_csv(DATA_DIR / "olist_order_items_dataset.csv")
            order_payments = pd.read_csv(DATA_DIR / "olist_order_payments_dataset.csv")
            order_reviews = pd.read_csv(DATA_DIR / "olist_order_reviews_dataset.csv")
            products = pd.read_csv(DATA_DIR / "olist_products_dataset.csv")
            sellers = pd.read_csv(DATA_DIR / "olist_sellers_dataset.csv")
            customers = pd.read_csv(DATA_DIR / "olist_customers_dataset.csv")
            category_translation = pd.read_csv(DATA_DIR / "product_category_name_translation.csv")
        except Exception as e:
            print(f"Error reading CSV files: {e}")
            raise e

        # Clean datetime columns in orders
        datetime_cols = ['order_purchase_timestamp', 'order_approved_at', 
                         'order_delivered_carrier_date', 'order_delivered_customer_date', 
                         'order_estimated_delivery_date']
        for col in datetime_cols:
            if col in orders.columns:
                orders[col] = pd.to_datetime(orders[col], errors='coerce')

        # Map product category names to English
        products = products.merge(category_translation, on='product_category_name', how='left')
        products['category'] = products['product_category_name_english'].fillna(products['product_category_name']).fillna('Uncategorized')

        # Deduplicate reviews to single average per order
        order_reviews_clean = order_reviews.groupby('order_id').agg({
            'review_score': 'mean',
            'review_comment_message': lambda x: ' | '.join(str(i) for i in x if pd.notna(i) and str(i).strip() != '')
        }).reset_index()

        # Calculate delivery metrics per order
        orders['delivery_duration_days'] = (orders['order_delivered_customer_date'] - orders['order_purchase_timestamp']).dt.total_seconds() / (24 * 3600)
        orders['is_delayed'] = (orders['order_delivered_customer_date'] > orders['order_estimated_delivery_date']).astype(int)
        orders['delivery_delay_days'] = np.maximum(0, (orders['order_delivered_customer_date'] - orders['order_estimated_delivery_date']).dt.total_seconds() / (24 * 3600))
        orders['is_canceled'] = (orders['order_status'] == 'canceled').astype(int)

        # Merge core order_items with orders, sellers, products, reviews
        items_full = order_items.merge(orders, on='order_id', how='inner')
        items_full = items_full.merge(sellers, on='seller_id', how='left')
        items_full = items_full.merge(products[['product_id', 'category']], on='product_id', how='left')
        items_full = items_full.merge(order_reviews_clean, on='order_id', how='left')

        # Store primary merged dataset & clean reference tables
        self.data = {
            'orders': orders,
            'order_items': order_items,
            'order_reviews': order_reviews_clean,
            'products': products,
            'sellers': sellers,
            'customers': customers,
            'items_full': items_full
        }
        
        # Precompute aggregated seller metrics dataset for speed & ML training
        self._compute_seller_metrics()
        self.loaded = True
        print("Data loaded & precomputed successfully.")
        return self.data

    def _compute_seller_metrics(self):
        df = self.data['items_full']
        
        # Group by seller_id
        seller_grp = df.groupby('seller_id')

        # Basic aggregations
        metrics = seller_grp.agg(
            total_revenue=('price', 'sum'),
            total_freight=('freight_value', 'sum'),
            total_items=('order_item_id', 'count'),
            total_orders=('order_id', 'nunique'),
            avg_rating=('review_score', 'mean'),
            avg_delivery_time=('delivery_duration_days', 'mean'),
            delayed_orders=('is_delayed', 'sum'),
            canceled_orders=('is_canceled', 'sum'),
            unique_products=('product_id', 'nunique'),
            primary_city=('seller_city', 'first'),
            primary_state=('seller_state', 'first')
        ).reset_index()

        # Handle NaNs in metrics
        metrics['avg_rating'] = metrics['avg_rating'].fillna(df['review_score'].mean())
        metrics['avg_delivery_time'] = metrics['avg_delivery_time'].fillna(df['delivery_duration_days'].mean())
        metrics['avg_order_value'] = metrics['total_revenue'] / np.maximum(1, metrics['total_orders'])
        metrics['delayed_percentage'] = (metrics['delayed_orders'] / np.maximum(1, metrics['total_orders'])) * 100
        metrics['cancellation_rate'] = (metrics['canceled_orders'] / np.maximum(1, metrics['total_orders'])) * 100

        # Calculate Performance Score formula:
        # Score = 0.30*Revenue + 0.25*Order + 0.20*Rating + 0.15*Delivery + 0.10*Reliability
        # Min-Max Normalization helper function
        def min_max_norm(series, invert=False):
            min_val = series.min()
            max_val = series.max()
            if max_val == min_val:
                return pd.Series(100.0, index=series.index)
            norm = (series - min_val) / (max_val - min_val) * 100.0
            return 100.0 - norm if invert else norm

        # Revenue score (log scale normalized for heavy skew)
        log_rev = np.log1p(metrics['total_revenue'])
        metrics['revenue_score'] = min_max_norm(log_rev)

        # Order count score (log scale)
        log_orders = np.log1p(metrics['total_orders'])
        metrics['order_score'] = min_max_norm(log_orders)

        # Rating score (0-5 scale mapped to 0-100)
        metrics['rating_score'] = ((metrics['avg_rating'] - 1.0) / 4.0 * 100.0).clip(0, 100)

        # Delivery score (inverted delivery time in days)
        # Cap high delivery times to 60 for normalization
        capped_delivery = metrics['avg_delivery_time'].clip(0, 60)
        metrics['delivery_score'] = min_max_norm(capped_delivery, invert=True)

        # Reliability score (inverted cancellation + delayed rate)
        unreliability = metrics['cancellation_rate'] + metrics['delayed_percentage']
        metrics['reliability_score'] = min_max_norm(unreliability.clip(0, 100), invert=True)

        # Weighted final performance score
        metrics['performance_score'] = (
            0.30 * metrics['revenue_score'] +
            0.25 * metrics['order_score'] +
            0.20 * metrics['rating_score'] +
            0.15 * metrics['delivery_score'] +
            0.10 * metrics['reliability_score']
        ).round(2)

        self.seller_metrics = metrics

    def get_dashboard_kpis(self) -> Dict[str, Any]:
        df = self.data['items_full']
        orders = self.data['orders']
        sellers = self.data['sellers']
        
        total_sellers = len(sellers)
        total_orders = orders['order_id'].nunique()
        total_revenue = float(df['price'].sum())
        avg_order_value = float(total_revenue / total_orders) if total_orders > 0 else 0
        avg_rating = float(df['review_score'].mean())
        avg_delivery_time = float(orders['delivery_duration_days'].mean())
        delayed_orders = int(orders['is_delayed'].sum())
        canceled_orders = int(orders['is_canceled'].sum())
        cancellation_rate = float((canceled_orders / total_orders) * 100) if total_orders > 0 else 0

        # Monthly Revenue & Monthly Orders trend
        df_valid_dates = df.dropna(subset=['order_purchase_timestamp']).copy()
        df_valid_dates['year_month'] = df_valid_dates['order_purchase_timestamp'].dt.to_period('M').astype(str)
        
        monthly_trend = df_valid_dates.groupby('year_month').agg(
            revenue=('price', 'sum'),
            orders=('order_id', 'nunique')
        ).reset_index().sort_values('year_month')
        
        # Performance Distribution histogram bins
        scores = self.seller_metrics['performance_score']
        hist, bin_edges = np.histogram(scores, bins=[0, 20, 40, 60, 80, 100])
        score_distribution = [
          {"range": "0-20 (Poor)", "count": int(hist[0])},
          {"range": "21-40 (Below Avg)", "count": int(hist[1])},
          {"range": "41-60 (Average)", "count": int(hist[2])},
          {"range": "61-80 (Good)", "count": int(hist[3])},
          {"range": "81-100 (Top)", "count": int(hist[4])}
        ]

        # Top product categories
        cat_trend = df.groupby('category').agg(
            revenue=('price', 'sum'),
            orders=('order_id', 'nunique')
        ).reset_index().sort_values('revenue', ascending=False).head(10)

        return {
            "kpis": {
                "total_sellers": total_sellers,
                "total_orders": total_orders,
                "total_revenue": round(total_revenue, 2),
                "avg_order_value": round(avg_order_value, 2),
                "avg_rating": round(avg_rating, 2),
                "avg_delivery_time": round(avg_delivery_time, 1),
                "delayed_orders": delayed_orders,
                "cancellation_rate": round(cancellation_rate, 2)
            },
            "monthly_trend": monthly_trend.to_dict(orient='records'),
            "score_distribution": score_distribution,
            "top_categories": cat_trend.to_dict(orient='records')
        }

data_loader = DataLoader()
