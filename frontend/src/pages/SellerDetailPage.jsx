import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSellerDetails } from '../services/api';
import { LoadingSpinner, ErrorState, PerformanceBadge } from '../components/UIFeedback';
import KpiCard from '../components/KpiCard';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Star, 
  Clock, 
  AlertTriangle, 
  Sparkles 
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const SellerDetailPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSeller = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSellerDetails(sellerId);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load seller details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeller();
  }, [sellerId]);

  if (loading) return <LoadingSpinner label={`Analyzing seller ${sellerId}...`} />;
  if (error) return <ErrorState message={error} onRetry={fetchSeller} />;

  const { seller, trends, categories, summary } = data;

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/sellers')}
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sellers Directory
        </button>
      </div>

      {/* Seller Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-xl font-bold font-mono text-white">{seller.seller_id}</h2>
            <PerformanceBadge score={seller.performance_score} />
          </div>
          <div className="flex items-center text-xs text-slate-400 space-x-4">
            <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-indigo-400" /> {seller.city}, {seller.state}</span>
            <span>Total Unique Products: <strong className="text-white">{seller.total_items}</strong></span>
          </div>
        </div>

        {/* 5-Factor Score Breakdown Pill */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 flex items-center space-x-6">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Revenue</span>
            <p className="text-sm font-bold text-indigo-400">{seller.revenue_score.toFixed(0)}/100</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Order Vol</span>
            <p className="text-sm font-bold text-emerald-400">{seller.order_score.toFixed(0)}/100</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Rating</span>
            <p className="text-sm font-bold text-amber-400">{seller.rating_score.toFixed(0)}/100</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Delivery</span>
            <p className="text-sm font-bold text-purple-400">{seller.delivery_score.toFixed(0)}/100</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Reliability</span>
            <p className="text-sm font-bold text-cyan-400">{seller.reliability_score.toFixed(0)}/100</p>
          </div>
        </div>
      </div>

      {/* Generated AI Performance Summary */}
      <div className="bg-gradient-to-r from-indigo-950/30 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 rounded-2xl shadow-lg">
        <div className="flex items-center space-x-2 text-indigo-400 mb-3 font-semibold text-sm">
          <Sparkles className="w-5 h-5" />
          <span>Backend Analytics AI Insight Summary</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          {summary.map((point, idx) => (
            <li key={idx} className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Gross Revenue"
          value={`R$ ${seller.total_revenue.toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
        />
        <KpiCard
          title="Total Completed Orders"
          value={seller.total_orders.toLocaleString()}
          icon={ShoppingCart}
          color="indigo"
        />
        <KpiCard
          title="Average Order Value"
          value={`R$ ${seller.avg_order_value.toFixed(2)}`}
          icon={Package}
          color="purple"
        />
        <KpiCard
          title="Average Rating"
          value={`${seller.avg_rating.toFixed(2)} / 5.0`}
          icon={Star}
          color="amber"
        />
        <KpiCard
          title="Avg Delivery Time"
          value={`${seller.avg_delivery_time.toFixed(1)} Days`}
          icon={Clock}
          color="cyan"
        />
        <KpiCard
          title="Delayed Delivery %"
          value={`${seller.delayed_percentage.toFixed(1)}%`}
          icon={AlertTriangle}
          color="rose"
        />
        <KpiCard
          title="Cancellation Rate"
          value={`${seller.cancellation_rate.toFixed(2)}%`}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <h3 className="text-base font-bold text-white mb-4">Revenue Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year_month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98120" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Trend */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <h3 className="text-base font-bold text-white mb-4">Review Score Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year_month" stroke="#64748b" fontSize={11} />
                <YAxis domain={[1, 5]} stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Line type="monotone" dataKey="avg_rating" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Category Contribution */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <h3 className="text-base font-bold text-white mb-4">Category Contribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.category.slice(0, 12)}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDetailPage;
