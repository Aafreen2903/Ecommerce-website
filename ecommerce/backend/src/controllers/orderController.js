// src/controllers/orderController.js
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'mock_stripe_key');

// @desc    Create Stripe PaymentIntent
// @route   POST /api/orders/payment-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { items } = req.body; // array of { product: productId, quantity: Number }

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in order');
  }

  // Verify prices from DB to prevent client-side price manipulation
  let totalAmount = 0;
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.product} not found`);
    }
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    totalAmount += price * item.quantity;
  }

  // Round to 2 decimal places and convert to cents (Stripe expects integer cents)
  const amountInCents = Math.round(totalAmount * 100);

  // Fallback for missing Stripe Key
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('⚠️ Stripe Secret Key missing. Using simulated payment.');
    return res.status(200).json({
      clientSecret: 'mock_secret_key_12345',
      totalAmount,
      isMock: true,
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { userId: req.user._id.toString() },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      totalAmount,
      isMock: false,
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Stripe payment failed: ${error.message}`);
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { products, shippingAddress, paymentInfo, totalAmount } = req.body;

  if (!products || products.length === 0) {
    res.status(400);
    throw new Error('No ordered items');
  }

  // Create order
  const order = new Order({
    user: req.user._id,
    products,
    shippingAddress,
    paymentInfo,
    totalAmount,
  });

  const createdOrder = await order.save();

  // Deduct stock and update user history
  for (const item of products) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      await product.save();
    }
  }

  // Save to User history
  const user = await User.findById(req.user._id);
  if (user) {
    user.orderHistory.push(createdOrder._id);
    await user.save();
  }

  res.status(201).json(createdOrder);
});

// @desc    Get current user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    // Auth check: Admin can view any order, customer can only view their own
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Auth check
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    if (order.orderStatus === 'Delivered' || order.orderStatus === 'Shipped') {
      res.status(400);
      throw new Error('Cannot cancel a shipped or delivered order');
    }

    order.orderStatus = 'Cancelled';
    const updatedOrder = await order.save();

    // Restore stock
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

module.exports = {
  createPaymentIntent,
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
