// src/controllers/adminController.js
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard analytics (Total users, products, orders, revenue, and charts data)
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Aggregate total revenue (sum of totalAmount for non-cancelled orders)
  const revenueAggregation = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
  ]);

  const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

  // Recent 5 orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email');

  // Products by Category (For charts)
  const categoryShare = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  // Order status breakdown (For charts)
  const orderStatusBreakdown = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
  ]);

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentOrders,
    categoryShare,
    orderStatusBreakdown,
  });
});

// @desc    Get all orders (Admin only)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email');
  res.json(orders);
});

// @desc    Update order status (Admin only)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.orderStatus = orderStatus;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// @desc    Block or unblock user (Admin only)
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const toggleBlockUser = asyncHandler(async (req, res) => {
  const { isBlocked } = req.body;
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot block an admin user');
    }

    user.isBlocked = isBlocked;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isBlocked: updatedUser.isBlocked,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete an admin user');
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  getDashboardAnalytics,
  getAdminOrders,
  updateOrderStatus,
  getAdminUsers,
  toggleBlockUser,
  deleteUser,
};
