import React, { useEffect, useState } from 'react';
import { getDeliveryPerformance } from '../services/api';
import { LoadingSpinner, ErrorState } from '../components/UIFeedback';
import KpiCard from '../components/KpiCard';
import { Clock, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

const DeliveryPerformancePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDelivery = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDeliveryPerformance();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load delivery analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, []);

  if (loading) return <LoadingSpinner label="Calculating delivery lead times and delays..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDelivery} />;

  const { avg_delivery_time_days, avg_estimated_time_days, delayed_orders_count, on_time_percentage, monthly_delivery_trend } = data;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-white">Logistics & Delivery Performance Analytics</h2>
        <p className="text-xs text-slate-400">
          Comparing estimated promised carrier delivery vs actual delivery lead times across Brazil.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="On-Time Delivery Rate"
          value={`${on_time_percentage.toFixed(1)}%`}
          subtitle="Delivered before estimated date"
          icon={CheckCircle}
          color="emerald"
        />
        <KpiCard
          title="Avg Actual Delivery Time"
          value={`${avg_delivery_time_days.toFixed(1)} Days`}
          subtitle="Order purchase to customer receipt"
          icon={Clock}
          color="indigo"
        />
        <KpiCard
          title="Avg Estimated Time"
          value={`${avg_estimated_time_days.toFixed(1)} Days`}
          subtitle="Initial carrier promised target"
          icon={Calendar}
          color="purple"
        />
        <KpiCard
          title="Total Delayed Orders"
          value={delayed_orders_count.toLocaleString()}
          subtitle="Missed promised delivery window"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Actual vs Estimated Delivery Trend */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white">Estimated vs. Actual Delivery Lead Times (Days)</h3>
          <p className="text-xs text-slate-400">Monthly comparison of estimated target vs true delivery fulfillment</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly_delivery_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year_month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} unit=" d" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="actual_days" name="Actual Delivery Days" stroke="#6366f1" strokeWidth={2} />
              <Line type="monotone" dataKey="estimated_days" name="Estimated Delivery Days" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPerformancePage;
