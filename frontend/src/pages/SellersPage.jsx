import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSellers } from '../services/api';
import { LoadingSpinner, ErrorState, PerformanceBadge } from '../components/UIFeedback';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const SellersPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [minRevenue, setMinRevenue] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minOrders, setMinOrders] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('total_revenue');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchSellersList = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 15,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(search && { search }),
        ...(minRevenue && { min_revenue: parseFloat(minRevenue) }),
        ...(minRating && { min_rating: parseFloat(minRating) }),
        ...(minOrders && { min_orders: parseInt(minOrders, 10) })
      };
      const res = await getSellers(params);
      setData(res.data);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      setError(err.message || 'Failed to fetch sellers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellersList();
  }, [page, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSellersList();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Seller Performance Directory</h2>
          <p className="text-xs text-slate-400">
            Search, filter, and inspect detailed performance analytics for all {total.toLocaleString()} registered marketplace sellers.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Seller ID, City, or State..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Min Revenue (R$)"
              value={minRevenue}
              onChange={(e) => setMinRevenue(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3.0">3.0+ Stars</option>
            </select>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            <Filter className="w-4 h-4 mr-2" /> Apply Filters
          </button>
        </form>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner label="Querying Olist Sellers Database..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSellersList} />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('seller_id')}>
                    <div className="flex items-center">Seller ID <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('total_orders')}>
                    <div className="flex items-center">Orders <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('total_revenue')}>
                    <div className="flex items-center">Total Revenue <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('avg_order_value')}>
                    <div className="flex items-center">AOV <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('avg_rating')}>
                    <div className="flex items-center">Rating <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('avg_delivery_time')}>
                    <div className="flex items-center">Avg Delivery <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('delayed_percentage')}>
                    <div className="flex items-center">Delay % <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('performance_score')}>
                    <div className="flex items-center">Score <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                  </th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-slate-500">
                      No sellers match the specified filter criteria.
                    </td>
                  </tr>
                ) : (
                  data.map((seller) => (
                    <tr key={seller.seller_id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-mono text-xs font-semibold text-indigo-400">
                        {seller.seller_id.slice(0, 14)}...
                        <div className="text-[10px] text-slate-500 font-sans">{seller.primary_city}, {seller.primary_state}</div>
                      </td>
                      <td className="p-4 font-semibold">{seller.total_orders.toLocaleString()}</td>
                      <td className="p-4 font-semibold text-emerald-400">R$ {seller.total_revenue.toLocaleString()}</td>
                      <td className="p-4">R$ {seller.avg_order_value.toFixed(2)}</td>
                      <td className="p-4">
                        <span className="font-semibold text-amber-400">★ {seller.avg_rating.toFixed(2)}</span>
                      </td>
                      <td className="p-4">{seller.avg_delivery_time.toFixed(1)} days</td>
                      <td className="p-4 text-rose-400 font-medium">{seller.delayed_percentage.toFixed(1)}%</td>
                      <td className="p-4">
                        <PerformanceBadge score={seller.performance_score} />
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => navigate(`/sellers/${seller.seller_id}`)}
                          className="p-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg transition-colors"
                          title="View Full Seller Analytics"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing page <span className="font-semibold text-white">{page}</span> of{' '}
              <span className="font-semibold text-white">{totalPages}</span> ({total.toLocaleString()} sellers)
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-lg text-slate-200 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-lg text-slate-200 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellersPage;
