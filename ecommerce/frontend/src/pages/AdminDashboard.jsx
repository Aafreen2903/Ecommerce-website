import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DollarSign, ShoppingCart, Users, Package, Clock, ShieldAlert } from 'lucide-react';
import { fetchAnalytics } from '../redux/slices/adminSlice';
import { DashboardSkeleton } from '../components/LoadingSkeleton';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { analytics, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  if (loading && !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldAlert size={40} className="text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Failed to load analytics</h2>
        <p className="text-xs text-gray-400">{error}</p>
      </div>
    );
  }

  if (!analytics) return null;

  const { totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders, categoryShare, orderStatusBreakdown } = analytics;

  // Find max category count to calibrate charts
  const maxCategoryCount = Math.max(...categoryShare.map((c) => c.count), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="text-left border-b border-gray-150 dark:border-darkBorder/40 pb-4">
        <h1 className="text-2xl font-black text-gray-850 dark:text-white m-0">Admin Dashboard</h1>
        <p className="text-xs text-gray-400 mt-1">Real-time business performance metrics</p>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: <DollarSign size={20} className="text-brand-500" />, bg: 'bg-brand-500/10' },
          { label: 'Total Orders', value: totalOrders, icon: <ShoppingCart size={20} className="text-indigo-500" />, bg: 'bg-indigo-500/10' },
          { label: 'Products In Store', value: totalProducts, icon: <Package size={20} className="text-amber-500" />, bg: 'bg-amber-500/10' },
          { label: 'Registered Users', value: totalUsers, icon: <Users size={20} className="text-emerald-500" />, bg: 'bg-emerald-500/10' },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder p-6 rounded-3xl flex items-center justify-between shadow-sm text-left transition-all hover:shadow-md"
          >
            <div className="space-y-1">
              <p className="text-xs text-gray-450 font-bold">{card.label}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{card.value}</p>
            </div>
            <div className={`p-3.5 rounded-2xl ${card.bg} shrink-0`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Visual Charts Summary & Categories Shares */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category Share chart */}
        <div className="lg:col-span-2 bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 shadow-sm text-left space-y-6">
          <div>
            <h3 className="text-sm font-black text-gray-805 dark:text-gray-150 m-0">Products Catalog distribution</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Item counts sorted by categories</p>
          </div>
          
          <div className="space-y-4">
            {categoryShare.map((cat, idx) => {
              const percentage = (cat.count / maxCategoryCount) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span>{cat._id}</span>
                    <span>{cat.count} product{cat.count > 1 && 's'}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 shadow-sm text-left space-y-6">
          <div>
            <h3 className="text-sm font-black text-gray-805 dark:text-gray-150 m-0">Order Status Breakdown</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Summary of transaction cycles</p>
          </div>
          
          <div className="space-y-4">
            {orderStatusBreakdown.map((status, idx) => {
              const totalBreakdownOrders = orderStatusBreakdown.reduce((sum, item) => sum + item.count, 0);
              const percentage = totalBreakdownOrders > 0 ? (status.count / totalBreakdownOrders) * 100 : 0;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-24 text-xs font-bold text-gray-750 dark:text-gray-300 truncate">{status._id}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-gray-950 dark:text-white shrink-0">
                    {status.count} ({Math.round(percentage)}%)
                  </span>
                </div>
              );
            })}
            {orderStatusBreakdown.length === 0 && (
              <p className="text-xs text-gray-450 py-10 text-center">No orders registered yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 shadow-sm text-left space-y-4">
        <h3 className="text-sm font-black text-gray-805 dark:text-gray-150 m-0 flex items-center gap-2">
          <Clock size={16} className="text-brand-500" /> Recent Sales
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-darkBorder/40 text-gray-450 dark:text-gray-400 text-left font-bold uppercase tracking-wider">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-darkBorder/20">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-darkBg/10">
                  <td className="p-3 font-mono text-[10px] text-gray-500">{order._id}</td>
                  <td className="p-3 font-semibold text-gray-750 dark:text-gray-300">{order.user?.name || 'Deleted User'}</td>
                  <td className="p-3 text-gray-450">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 font-extrabold text-gray-800 dark:text-white">${order.totalAmount.toFixed(2)}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-gray-150 dark:border-darkBorder/40 bg-gray-50 dark:bg-darkBg text-gray-650 dark:text-gray-400">
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-450">No sales recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
