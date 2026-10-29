from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import numpy as np
import pandas as pd
from data_loader import data_loader
from ml_model import MLPredictor

app = FastAPI(
    title="Seller Performance Intelligence API",
    description="Data Science & Business Intelligence Backend for Olist Brazilian E-Commerce Dataset",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = None

@app.on_event("startup")
def startup_event():
    global predictor
    data_loader.load_data()
    predictor = MLPredictor(data_loader)
    predictor.train_model()

@app.get("/")
def read_root():
    return {"status": "online", "system": "Seller Performance Intelligence API", "dataset": "Olist Brazilian E-Commerce"}

@app.get("/api/dashboard")
def get_dashboard():
    return data_loader.get_dashboard_kpis()

@app.get("/api/sellers")
def get_sellers(
    search: Optional[str] = None,
    min_revenue: Optional[float] = None,
    max_revenue: Optional[float] = None,
    min_rating: Optional[float] = None,
    min_orders: Optional[int] = None,
    page: int = 1,
    limit: int = 20,
    sort_by: str = "total_revenue",
    sort_order: str = "desc"
):
    df = data_loader.seller_metrics.copy()

    # Filtering
    if search:
        df = df[df['seller_id'].str.contains(search, case=False, na=False) | 
                df['primary_city'].str.contains(search, case=False, na=False) |
                df['primary_state'].str.contains(search, case=False, na=False)]
    if min_revenue is not None:
        df = df[df['total_revenue'] >= min_revenue]
    if max_revenue is not None:
        df = df[df['total_revenue'] <= max_revenue]
    if min_rating is not None:
        df = df[df['avg_rating'] >= min_rating]
    if min_orders is not None:
        df = df[df['total_orders'] >= min_orders]

    # Sorting
    ascending = True if sort_order.lower() == 'asc' else False
    if sort_by in df.columns:
        df = df.sort_values(by=sort_by, ascending=ascending)

    total_count = len(df)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_df = df.iloc[start_idx:end_idx]

    records = paginated_df.to_dict(orient='records')
    # Round numerical fields
    for r in records:
        r['total_revenue'] = round(r['total_revenue'], 2)
        r['avg_order_value'] = round(r['avg_order_value'], 2)
        r['avg_rating'] = round(r['avg_rating'], 2)
        r['avg_delivery_time'] = round(r['avg_delivery_time'], 1)
        r['cancellation_rate'] = round(r['cancellation_rate'], 2)
        r['delayed_percentage'] = round(r['delayed_percentage'], 2)
        r['performance_score'] = round(r['performance_score'], 2)

    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": int(np.ceil(total_count / limit)),
        "data": records
    }

@app.get("/api/sellers/{seller_id}")
def get_seller_details(seller_id: str):
    metrics_df = data_loader.seller_metrics
    seller_row = metrics_df[metrics_df['seller_id'] == seller_id]
    if seller_row.empty:
        raise HTTPException(status_code=404, detail="Seller not found")

    seller_info = seller_row.iloc[0].to_dict()
    
    # Filter seller items full data
    items = data_loader.data['items_full']
    seller_items = items[items['seller_id'] == seller_id].copy()

    # Time series revenue & orders trend
    seller_items['year_month'] = seller_items['order_purchase_timestamp'].dt.to_period('M').astype(str)
    trend = seller_items.groupby('year_month').agg(
        revenue=('price', 'sum'),
        orders=('order_id', 'nunique'),
        avg_rating=('review_score', 'mean')
    ).reset_index().sort_values('year_month')
    trend['avg_rating'] = trend['avg_rating'].fillna(seller_info['avg_rating']).round(2)
    trend['revenue'] = trend['revenue'].round(2)

    # Category contribution
    categories = seller_items.groupby('category').agg(
        revenue=('price', 'sum'),
        orders=('order_id', 'nunique')
    ).reset_index().sort_values('revenue', ascending=False)
    categories['revenue'] = categories['revenue'].round(2)

    # Generated Backend AI Performance Summary
    score = seller_info['performance_score']
    rating = round(seller_info['avg_rating'], 2)
    delivery = round(seller_info['avg_delivery_time'], 1)
    rev = round(seller_info['total_revenue'], 2)

    summary_bullets = [
        f"Seller generated R$ {rev:,.2f} across {seller_info['total_orders']} orders.",
        f"Average customer review score is {rating} / 5.0.",
        f"Average delivery duration is {delivery} days, with {seller_info['delayed_percentage']:.1f}% delayed orders.",
        f"Overall performance score is {score:.1f} out of 100."
    ]

    return {
        "seller": {
            "seller_id": seller_info['seller_id'],
            "city": seller_info['primary_city'],
            "state": seller_info['primary_state'],
            "total_revenue": round(seller_info['total_revenue'], 2),
            "total_orders": seller_info['total_orders'],
            "total_items": seller_info['total_items'],
            "avg_order_value": round(seller_info['avg_order_value'], 2),
            "avg_rating": round(seller_info['avg_rating'], 2),
            "avg_delivery_time": round(seller_info['avg_delivery_time'], 1),
            "delayed_percentage": round(seller_info['delayed_percentage'], 2),
            "cancellation_rate": round(seller_info['cancellation_rate'], 2),
            "performance_score": round(seller_info['performance_score'], 2),
            "revenue_score": round(seller_info['revenue_score'], 2),
            "order_score": round(seller_info['order_score'], 2),
            "rating_score": round(seller_info['rating_score'], 2),
            "delivery_score": round(seller_info['delivery_score'], 2),
            "reliability_score": round(seller_info['reliability_score'], 2)
        },
        "trends": trend.to_dict(orient='records'),
        "categories": categories.to_dict(orient='records'),
        "summary": summary_bullets
    }

@app.get("/api/categories")
def get_categories():
    items = data_loader.data['items_full']
    cat_df = items.groupby('category').agg(
        revenue=('price', 'sum'),
        orders=('order_id', 'nunique'),
        avg_rating=('review_score', 'mean'),
        sellers_count=('seller_id', 'nunique')
    ).reset_index().sort_values('revenue', ascending=False)

    cat_df['revenue'] = cat_df['revenue'].round(2)
    cat_df['avg_rating'] = cat_df['avg_rating'].round(2)
    
    return cat_df.to_dict(orient='records')

@app.get("/api/customer-satisfaction")
def get_customer_satisfaction():
    reviews = data_loader.data['order_reviews']
    items = data_loader.data['items_full']

    # Rating distribution
    rating_counts = items['review_score'].value_counts().sort_index().to_dict()
    distribution = [
        {"score": "1 Star", "count": int(rating_counts.get(1.0, 0))},
        {"score": "2 Stars", "count": int(rating_counts.get(2.0, 0))},
        {"score": "3 Stars", "count": int(rating_counts.get(3.0, 0))},
        {"score": "4 Stars", "count": int(rating_counts.get(4.0, 0))},
        {"score": "5 Stars", "count": int(rating_counts.get(5.0, 0))},
    ]

    avg_score = float(items['review_score'].mean())
    positive_reviews = int(items[items['review_score'] >= 4]['order_id'].nunique())
    negative_reviews = int(items[items['review_score'] <= 2]['order_id'].nunique())

    # Category wise rating
    cat_rating = items.groupby('category').agg(
        avg_rating=('review_score', 'mean'),
        reviews_count=('review_score', 'count')
    ).reset_index().sort_values('avg_rating', ascending=False)
    cat_rating['avg_rating'] = cat_rating['avg_rating'].round(2)

    return {
        "avg_review_score": round(avg_score, 2),
        "total_reviews": len(items.dropna(subset=['review_score'])),
        "positive_reviews": positive_reviews,
        "negative_reviews": negative_reviews,
        "distribution": distribution,
        "category_ratings": cat_rating.head(15).to_dict(orient='records')
    }

@app.get("/api/delivery-performance")
def get_delivery_performance():
    orders = data_loader.data['orders']
    
    avg_delivery = float(orders['delivery_duration_days'].mean())
    avg_estimated = float((orders['order_estimated_delivery_date'] - orders['order_purchase_timestamp']).dt.total_seconds().mean() / (24*3600))
    
    delayed_count = int(orders['is_delayed'].sum())
    total_orders = len(orders.dropna(subset=['order_delivered_customer_date']))
    on_time_percentage = round(((total_orders - delayed_count) / np.maximum(1, total_orders)) * 100, 2)

    # Monthly comparison estimated vs actual
    orders_valid = orders.dropna(subset=['order_purchase_timestamp', 'order_delivered_customer_date']).copy()
    orders_valid['year_month'] = orders_valid['order_purchase_timestamp'].dt.to_period('M').astype(str)
    orders_valid['actual_days'] = (orders_valid['order_delivered_customer_date'] - orders_valid['order_purchase_timestamp']).dt.total_seconds() / (24*3600)
    orders_valid['estimated_days'] = (orders_valid['order_estimated_delivery_date'] - orders_valid['order_purchase_timestamp']).dt.total_seconds() / (24*3600)

    monthly_delivery = orders_valid.groupby('year_month').agg(
        actual_days=('actual_days', 'mean'),
        estimated_days=('estimated_days', 'mean')
    ).reset_index().sort_values('year_month')

    monthly_delivery['actual_days'] = monthly_delivery['actual_days'].round(1)
    monthly_delivery['estimated_days'] = monthly_delivery['estimated_days'].round(1)

    return {
        "avg_delivery_time_days": round(avg_delivery, 1),
        "avg_estimated_time_days": round(avg_estimated, 1),
        "delayed_orders_count": delayed_count,
        "on_time_percentage": on_time_percentage,
        "monthly_delivery_trend": monthly_delivery.to_dict(orient='records')
    }

@app.get("/api/performance-distribution")
def get_performance_distribution():
    scores = data_loader.seller_metrics['performance_score']
    hist, bin_edges = np.histogram(scores, bins=10, range=(0, 100))
    bins_data = []
    for i in range(len(hist)):
        bins_data.append({
            "range": f"{int(bin_edges[i])}-{int(bin_edges[i+1])}",
            "count": int(hist[i])
        })
    return bins_data

class PredictRequest(BaseModel):
    total_orders: float
    total_revenue: float
    avg_order_value: float
    avg_rating: float
    avg_delivery_time: float
    delayed_percentage: float
    cancellation_rate: float

@app.post("/api/predict")
def predict_seller_performance(req: PredictRequest):
    if predictor is None:
        raise HTTPException(status_code=500, detail="ML Predictor not initialized")
    return predictor.predict(req.dict())
