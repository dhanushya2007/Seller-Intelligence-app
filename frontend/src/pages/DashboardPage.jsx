import React, { useEffect, useState } from 'react';
import { getDashboardData } from '../services/api';
import KpiCard from '../components/KpiCard';
import { LoadingSpinner, ErrorState } from '../components/UIFeedback';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Clock, 
  AlertTriangle, 
  XCircle 
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDashboardData();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner label="Loading Executive Dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  const { kpis, monthly_trend, score_distribution, top_categories } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-1">Executive Seller Intelligence Dashboard</h2>
        <p className="text-sm text-slate-400">
          Real-time performance analytics aggregated across 3,095 active Brazilian marketplace sellers.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Active Sellers"
          value={kpis.total_sellers.toLocaleString()}
          subtitle="Unique merchants on platform"
          icon={Users}
          color="indigo"
        />
        <KpiCard
          title="Total Orders Processed"
          value={kpis.total_orders.toLocaleString()}
          subtitle="Delivered & active orders"
          icon={ShoppingCart}
          color="cyan"
        />
        <KpiCard
          title="Total Gross Revenue"
          value={`R$ ${(kpis.total_revenue / 1e6).toFixed(2)}M`}
          subtitle={`R$ ${kpis.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="emerald"
        />
        <KpiCard
          title="Average Order Value (AOV)"
          value={`R$ ${kpis.avg_order_value.toFixed(2)}`}
          subtitle="Per single completed order"
          icon={TrendingUp}
          color="purple"
        />
        <KpiCard
          title="Average Customer Rating"
          value={`${kpis.avg_rating.toFixed(2)} / 5.0`}
          subtitle="Across all verified reviews"
          icon={Star}
          color="amber"
        />
        <KpiCard
          title="Avg Delivery Duration"
          value={`${kpis.avg_delivery_time.toFixed(1)} Days`}
          subtitle="Purchase to buyer arrival"
          icon={Clock}
          color="indigo"
        />
        <KpiCard
          title="Delayed Orders"
          value={kpis.delayed_orders.toLocaleString()}
          subtitle="Exceeded estimated date"
          icon={AlertTriangle}
          color="rose"
        />
        <KpiCard
          title="Cancellation Rate"
          value={`${kpis.cancellation_rate.toFixed(2)}%`}
          subtitle="Platform overall default rate"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Revenue Trend (R$)</h3>
              <p className="text-xs text-slate-400">Total seller sales over time</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly_trend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year_month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  formatter={(val) => [`R$ ${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Orders Trend */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Order Volume</h3>
              <p className="text-xs text-slate-400">Number of orders fulfilled per month</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year_month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Score Distribution */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Seller Performance Score Distribution</h3>
            <p className="text-xs text-slate-400">Categorization of sellers based on 5-Factor Score</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={score_distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="range" type="category" stroke="#64748b" fontSize={11} width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Product Categories by Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Top 10 Product Categories by Sales</h3>
            <p className="text-xs text-slate-400">Categories driving marketplace revenue</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top_categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickFormatter={(v) => v.slice(0, 10) + '...'} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  formatter={(val) => [`R$ ${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
