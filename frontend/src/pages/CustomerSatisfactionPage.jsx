import React, { useEffect, useState } from 'react';
import { getCustomerSatisfaction } from '../services/api';
import { LoadingSpinner, ErrorState } from '../components/UIFeedback';
import KpiCard from '../components/KpiCard';
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

const CustomerSatisfactionPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSatisfaction = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCustomerSatisfaction();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load customer satisfaction analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSatisfaction();
  }, []);

  if (loading) return <LoadingSpinner label="Analyzing customer review distribution..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSatisfaction} />;

  const { avg_review_score, total_reviews, positive_reviews, negative_reviews, distribution, category_ratings } = data;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-white">Customer Satisfaction & Review Intelligence</h2>
        <p className="text-xs text-slate-400">
          Sentiment distribution and review score analysis across verified customer feedback.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Average Review Score"
          value={`${avg_review_score.toFixed(2)} / 5.0`}
          icon={Star}
          color="amber"
        />
        <KpiCard
          title="Total Evaluated Reviews"
          value={total_reviews.toLocaleString()}
          icon={MessageSquare}
          color="indigo"
        />
        <KpiCard
          title="Positive Reviews (4-5★)"
          value={positive_reviews.toLocaleString()}
          subtitle={`${((positive_reviews / total_reviews) * 100).toFixed(1)}% of total`}
          icon={ThumbsUp}
          color="emerald"
        />
        <KpiCard
          title="Negative Reviews (1-2★)"
          value={negative_reviews.toLocaleString()}
          subtitle={`${((negative_reviews / total_reviews) * 100).toFixed(1)}% of total`}
          icon={ThumbsDown}
          color="rose"
        />
      </div>

      {/* Visual Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <h3 className="text-base font-bold text-white mb-4">Review Score Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="score" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Highest Rated Categories */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <h3 className="text-base font-bold text-white mb-4">Highest Rated Categories (Avg Score)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={category_ratings} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[3, 5]} stroke="#64748b" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={10} width={130} tickFormatter={(v) => v.slice(0, 14)} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="avg_rating" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSatisfactionPage;
