// src/routes/orderRoutes.js
const express = require('express');
const {
  createPaymentIntent,
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All order routes require authentication

router.route('/')
  .post(createOrder);

router.route('/payment-intent')
  .post(createPaymentIntent);

router.route('/myorders')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/cancel')
  .put(cancelOrder);

module.exports = router;
