// src/routes/adminRoutes.js
const express = require('express');
const {
  getDashboardAnalytics,
  getAdminOrders,
  updateOrderStatus,
  getAdminUsers,
  toggleBlockUser,
  deleteUser,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // protect all admin routes
router.use(admin);   // restrict all routes to admin role only

router.route('/analytics')
  .get(getDashboardAnalytics);

router.route('/orders')
  .get(getAdminOrders);

router.route('/orders/:id/status')
  .put(updateOrderStatus);

router.route('/users')
  .get(getAdminUsers);

router.route('/users/:id/block')
  .put(toggleBlockUser);

router.route('/users/:id')
  .delete(deleteUser);

module.exports = router;
