import React, { useState } from 'react';
import { predictPerformance } from '../services/api';
import { PerformanceBadge, LoadingSpinner, ErrorState } from '../components/UIFeedback';
import { BrainCircuit, Sparkles, AlertCircle, Play, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const PredictiveAnalyticsPage = () => {
  const [formData, setFormData] = useState({
    total_orders: 150,
    total_revenue: 25000,
    avg_order_value: 166.67,
    avg_rating: 4.5,
    avg_delivery_time: 9.5,
    delayed_percentage: 3.2,
    cancellation_rate: 0.5
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await predictPerformance(formData);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Machine learning prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const featureChartData = result?.feature_importances ? Object.entries(result.feature_importances).map(([key, val]) => ({
    feature: key.replace(/_/g, ' '),
    importance: val
  })) : [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-xl flex items-start space-x-4">
        <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Machine Learning Seller Performance Forecaster</h2>
          <p className="text-xs text-slate-300 mt-1">
            Trained Random Forest Regressor predicting a merchant's overall 5-factor performance score based on operational inputs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <h3 className="text-base font-bold text-white mb-4 flex items-center">
            <Sparkles className="w-4 h-4 text-indigo-400 mr-2" /> Seller Operational Parameters
          </h3>

          <form onSubmit={handlePredict} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Total Orders Fulfilled</label>
              <input
                type="number"
                name="total_orders"
                value={formData.total_orders}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Total Gross Revenue (R$)</label>
              <input
                type="number"
                name="total_revenue"
                value={formData.total_revenue}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Average Order Value (AOV R$)</label>
              <input
                type="number"
                name="avg_order_value"
                value={formData.avg_order_value}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Average Customer Rating (1-5★)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                name="avg_rating"
                value={formData.avg_rating}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Avg Delivery Duration (Days)</label>
              <input
                type="number"
                step="0.1"
                name="avg_delivery_time"
                value={formData.avg_delivery_time}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Delayed %</label>
                <input
                  type="number"
                  step="0.1"
                  name="delayed_percentage"
                  value={formData.delayed_percentage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Cancellation %</label>
                <input
                  type="number"
                  step="0.1"
                  name="cancellation_rate"
                  value={formData.cancellation_rate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{loading ? 'Running ML Model Inference...' : 'Execute ML Forecast'}</span>
            </button>
          </form>
        </div>

        {/* Forecast Output */}
        <div className="lg:col-span-7 space-y-6">
          {error && <ErrorState message={error} />}

          {result ? (
            <div className="space-y-6">
              {/* Result Summary Card */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs uppercase font-semibold text-indigo-400 tracking-wider">Forecasted Performance Score</span>
                    <h3 className="text-3xl font-extrabold text-white mt-1">
                      {result.predicted_performance_score} <span className="text-sm font-normal text-slate-400">/ 100</span>
                    </h3>
                  </div>
                  <span className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold text-xs rounded-full">
                    {result.tier}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start space-x-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Recommendation:</strong> {result.recommendation}</span>
                  </div>
                </div>

                {/* Model Disclaimer */}
                <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/20 flex items-start space-x-2 text-amber-300/80 text-[11px]">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{result.disclaimer}</span>
                </div>
              </div>

              {/* Feature Importances Chart */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                <h4 className="text-sm font-bold text-white mb-3">Model Feature Importance Weightings</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" fontSize={10} />
                      <YAxis dataKey="feature" type="category" stroke="#64748b" fontSize={10} width={120} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                      <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400 space-y-3">
              <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-200">No ML Forecast Generated Yet</h3>
              <p className="text-xs max-w-sm mx-auto">
                Adjust the operational metrics on the left panel and click <strong>Execute ML Forecast</strong> to calculate model predictions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalyticsPage;
