import React, { useEffect, useState } from 'react';
import { getCategories } from '../services/api';
import { LoadingSpinner, ErrorState } from '../components/UIFeedback';
import { Package, TrendingUp, ShoppingBag, Star, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const CategoryAnalysisPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCategories();
      setCategories(res);
    } catch (err) {
      setError(err.message || 'Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) return <LoadingSpinner label="Processing product category metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCategories} />;

  const topByRevenue = categories.slice(0, 10);
  const topByOrders = [...categories].sort((a, b) => b.orders - a.orders).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-white">Product & Category Performance Analysis</h2>
        <p className="text-xs text-slate-400">
          Cross-category sales breakdown, customer ratings, order volume, and seller concentration across {categories.length} product categories.
        </p>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <h3 className="text-base font-bold text-white mb-4">Highest Revenue Categories (R$)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topByRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickFormatter={(v) => v.slice(0, 10) + '...'} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Category */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <h3 className="text-base font-bold text-white mb-4">Category Order Volume</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topByOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickFormatter={(v) => v.slice(0, 10) + '...'} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Full Category Breakdown</h3>
          <span className="text-xs text-slate-400">Total {categories.length} Categories</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">Category Name</th>
                <th className="p-4">Total Revenue</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Active Sellers</th>
                <th className="p-4">Avg Review Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {categories.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 font-medium text-white capitalize">{cat.category.replace(/_/g, ' ')}</td>
                  <td className="p-4 text-emerald-400 font-semibold">R$ {cat.revenue.toLocaleString()}</td>
                  <td className="p-4 font-semibold">{cat.orders.toLocaleString()}</td>
                  <td className="p-4 text-indigo-400">{cat.sellers_count}</td>
                  <td className="p-4 text-amber-400 font-semibold">★ {cat.avg_rating.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryAnalysisPage;
