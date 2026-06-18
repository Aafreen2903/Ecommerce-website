import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchMyOrders, cancelOrder } from '../redux/slices/orderSlice';

const OrderHistory = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const { userInfo } = useSelector((state) => state.auth);

  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, userInfo]);

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const handleCancelOrder = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder(id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500 border-amber-500/20';
      case 'Processing':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-500 border-blue-500/20';
      case 'Shipped':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-500 border-indigo-500/20';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500 border-emerald-500/20';
      case 'Cancelled':
        return 'bg-red-100 text-red-750 dark:bg-red-500/10 dark:text-red-500 border-red-500/20';
      default:
        return 'bg-gray-100 text-gray-750';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertCircle size={40} className="text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Failed to load order history</h2>
        <p className="text-xs text-gray-400">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto text-brand-500">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-150">No Orders Placed Yet</h2>
        <p className="text-xs text-gray-400">Your purchases will be listed here after checkout.</p>
        <Link to="/products" className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-brand-500/10">
          Go Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-left border-b border-gray-100 dark:border-darkBorder/40 pb-4">
        <h1 className="text-2xl font-black text-gray-850 dark:text-white m-0">My Order History</h1>
        <p className="text-xs text-gray-400 mt-1">Review status and details of past orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order._id;
          const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          const cancellable = ['Pending', 'Processing'].includes(order.orderStatus);

          return (
            <div
              key={order._id}
              onClick={() => toggleExpand(order._id)}
              className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all hover:border-gray-200 dark:hover:border-darkBorder/80 text-left"
            >
              {/* Order Row Header */}
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-4 gap-y-2 text-xs">
                  <div>
                    <p className="text-gray-400">Order Placed</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{formattedDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Price</p>
                    <p className="font-bold text-gray-800 dark:text-gray-250 mt-0.5">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-gray-400">Order ID</p>
                    <p className="font-mono text-[10px] text-gray-500 mt-1">{order._id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  {cancellable && (
                    <button
                      onClick={(e) => handleCancelOrder(order._id, e)}
                      className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/20 transition-all shrink-0"
                    >
                      Cancel Order
                    </button>
                  )}
                  <div className="text-gray-450 dark:text-gray-500 shrink-0">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              {/* Order Expanded Details */}
              {isExpanded && (
                <div className="bg-gray-50/50 dark:bg-darkBg/30 border-t border-gray-100 dark:border-darkBorder/40 p-4 sm:p-6 space-y-6">
                  {/* Products Grid list */}
                  <div className="space-y-4">
                    {order.products.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-850 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-darkBorder">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 text-xs text-left">
                          <h4 className="font-bold text-gray-800 dark:text-gray-200 truncate">{item.title}</h4>
                          <p className="text-gray-400 mt-0.5">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-xs font-black text-gray-800 dark:text-white shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery address details summary */}
                  <div className="pt-4 border-t border-gray-100 dark:border-darkBorder/30 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Shipping Address</h4>
                      <p className="text-gray-500 leading-relaxed">
                        {order.shippingAddress.address} <br />
                        {order.shippingAddress.city}, {order.shippingAddress.postalCode} <br />
                        {order.shippingAddress.country}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Payment Details</h4>
                      <p className="text-gray-500 leading-relaxed">
                        Method: {order.paymentInfo.method} <br />
                        Transaction ID: <span className="font-mono text-[10px] text-gray-400">{order.paymentInfo.id}</span> <br />
                        Status: <span className="text-emerald-500 font-semibold">{order.paymentInfo.status}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;
