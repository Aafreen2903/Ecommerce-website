// src/controllers/cartController.js
const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc Get user's cart
// @route GET /api/cart
// @access Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) {
    // create empty cart if not exists
    const newCart = await Cart.create({ user: req.user._id, items: [] });
    return res.json(newCart);
  }
  res.json(cart);
});

const syncCart = asyncHandler(async (req, res) => {
  const { items } = req.body; // Expected format: [{ product: productId, quantity: Number }]
  if (!Array.isArray(items)) {
    res.status(400);
    throw new Error('Items must be an array');
  }
  // Ensure product references are valid
  for (const i of items) {
    if (!i.product || typeof i.quantity !== 'number') {
      res.status(400);
      throw new Error('Each item must have product and quantity');
    }
    const prod = await Product.findById(i.product);
    if (!prod) {
      res.status(404);
      throw new Error(`Product ${i.product} not found`);
    }
  }

  // Find existing cart or create a new one
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  // Replace cart items with the supplied list (merge could be added later)
  cart.items = items.map(i => ({ product: i.product, quantity: i.quantity }));
  await cart.save();
  res.json(cart);
});
  const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  const existingItem = cart.items.find(p => p.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  res.status(201).json(cart);
});

// @desc Update cart item quantity
// @route PUT /api/cart/:itemId
// @access Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  const item = cart.items.id(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Cart item not found');
  }
  item.quantity = quantity;
  await cart.save();
  res.json(cart);
});

// @desc Remove item from cart
// @route DELETE /api/cart/:itemId
// @access Private
const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  cart.items.id(itemId).remove();
  await cart.save();
  res.json({ message: 'Item removed', cart });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    // If no cart exists, respond with empty cart
    return res.json({ message: 'Cart cleared', cart: { user: req.user._id, items: [] } });
  }
  cart.items = [];
  await cart.save();
  res.json({ message: 'Cart cleared', cart });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, syncCart, clearCart };
