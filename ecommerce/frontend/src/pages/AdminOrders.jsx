import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminFetchAllOrders, adminUpdateOrderStatus, cancelOrder } from '../redux/slices/orderSlice';
import { TableRowSkeleton } from '../components/LoadingSkeleton';

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { adminOrders: orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(adminFetchAllOrders());
  }, [dispatch]);

  const handleStatusChange = (id, status) => {
    dispatch(adminUpdateOrderStatus({ id, status }));
  };

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder(id)).then(() => {
        dispatch(adminFetchAllOrders()); // refresh admin lists
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Processing': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Shipped': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      case 'Delivered': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="text-left border-b border-gray-150 dark:border-darkBorder/40 pb-4">
        <h1 className="text-2xl font-black text-gray-850 dark:text-white m-0">Manage Orders</h1>
        <p className="text-xs text-gray-400 mt-1">Fulfillment cycle tracker and order status tools</p>
      </div>

      {/* Orders datatable */}
      <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 shadow-sm overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-darkBorder/40 text-gray-450 dark:text-gray-400 text-left font-bold uppercase tracking-wider">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Update Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-darkBorder/20">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-darkBg/10">
                    <td className="p-3 font-mono text-[10px] text-gray-500">{order._id}</td>
                    <td className="p-3">
                      <div className="text-left">
                        <p className="font-bold text-gray-800 dark:text-gray-200">{order.user?.name || 'Deleted User'}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{order.user?.email || ''}</p>
                      </div>
                    </td>
                    <td className="p-3 text-gray-450">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 font-extrabold text-gray-800 dark:text-white">${order.totalAmount.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={order.orderStatus === 'Cancelled' || order.orderStatus === 'Delivered'}
                        className="bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-gray-250 focus:outline-none disabled:opacity-40"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled" disabled>Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      {['Pending', 'Processing'].includes(order.orderStatus) && (
                        <button
                          onClick={() => handleCancel(order._id)}
                          className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/20 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
