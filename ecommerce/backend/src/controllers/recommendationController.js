// src/controllers/recommendationController.js
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Recommend similar products based on category
// @route   GET /api/recommendations/similar/:productId
// @access  Public
const getSimilarProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Find products in same category, excluding current product
  const recommendations = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  })
    .limit(4)
    .sort({ ratings: -1 }); // sort by ratings

  res.json(recommendations);
});

// @desc    Recommend products based on purchase history
// @route   GET /api/recommendations/purchase-history
// @access  Private
const getPurchaseHistoryRecommendations = asyncHandler(async (req, res) => {
  // Find completed user orders
  const orders = await Order.find({ user: req.user._id, orderStatus: { $ne: 'Cancelled' } });

  if (orders.length === 0) {
    // Fallback: return top rated products
    const fallback = await Product.find({}).sort({ ratings: -1 }).limit(4);
    return res.json(fallback);
  }

  // Extract all product IDs purchased
  const purchasedProductIds = [];
  orders.forEach((order) => {
    order.products.forEach((p) => {
      purchasedProductIds.push(p.product.toString());
    });
  });

  // Get categories of purchased products
  const products = await Product.find({ _id: { $in: purchasedProductIds } });
  const categories = [...new Set(products.map((p) => p.category))];

  // Suggest popular products in those categories, excluding already purchased products
  const recommendations = await Product.find({
    category: { $in: categories },
    _id: { $nin: purchasedProductIds },
  })
    .limit(4)
    .sort({ ratings: -1 });

  res.json(recommendations);
});

// @desc    Recommend products based on wishlist
// @route   GET /api/recommendations/wishlist
// @access  Private
const getWishlistRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');

  if (!user || !user.wishlist || user.wishlist.length === 0) {
    // Fallback: return top rated products
    const fallback = await Product.find({}).sort({ ratings: -1 }).limit(4);
    return res.json(fallback);
  }

  const wishlistProductIds = user.wishlist.map((p) => p._id.toString());
  const categories = [...new Set(user.wishlist.map((p) => p.category))];

  // Recommend items in wishlist categories, excluding products already in wishlist
  const recommendations = await Product.find({
    category: { $in: categories },
    _id: { $nin: wishlistProductIds },
  })
    .limit(4)
    .sort({ ratings: -1 });

  res.json(recommendations);
});

// @desc    Show "Customers Also Bought"
// @route   GET /api/recommendations/also-bought/:productId
// @access  Public
const getCustomersAlsoBought = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  // Find orders that contain this product
  const orders = await Order.find({
    'products.product': productId,
    orderStatus: { $ne: 'Cancelled' },
  });

  if (orders.length === 0) {
    // Fallback: Return top products in same category
    const product = await Product.findById(productId);
    const fallbackQuery = product ? { category: product.category, _id: { $ne: productId } } : {};
    const fallback = await Product.find(fallbackQuery).sort({ ratings: -1 }).limit(4);
    return res.json(fallback);
  }

  // Count occurrences of other products bought in the same orders
  const productCounts = {};
  orders.forEach((order) => {
    order.products.forEach((p) => {
      const idStr = p.product.toString();
      if (idStr !== productId) {
        productCounts[idStr] = (productCounts[idStr] || 0) + 1;
      }
    });
  });

  // Sort products by frequency count
  const sortedProductIds = Object.keys(productCounts).sort(
    (a, b) => productCounts[b] - productCounts[a]
  );

  // Retrieve details for top 4 products
  const recommendations = await Product.find({
    _id: { $in: sortedProductIds.slice(0, 4) },
  });

  // If we found fewer than 4, pad with items in the same category
  if (recommendations.length < 4) {
    const product = await Product.findById(productId);
    const existingIds = recommendations.map((r) => r._id.toString()).concat(productId);

    const padQuery = product
      ? { category: product.category, _id: { $nin: existingIds } }
      : { _id: { $nin: existingIds } };

    const padding = await Product.find(padQuery).limit(4 - recommendations.length);
    recommendations.push(...padding);
  }

  res.json(recommendations);
});

// @desc    Show "Recommended For You" (personalized feed)
// @route   GET /api/recommendations/user-feed
// @access  Public (Optional auth)
const getUserFeedRecommendations = asyncHandler(async (req, res) => {
  // Check if user is authenticated (req.user is set by optional auth)
  if (!req.user) {
    // Default fallback: Top rated and trending
    const recommendations = await Product.find({}).sort({ ratings: -1, createdAt: -1 }).limit(6);
    return res.json(recommendations);
  }

  // User is authenticated - aggregate interests from order history and wishlist
  const user = await User.findById(req.user._id).populate('wishlist');
  const orders = await Order.find({ user: req.user._id, orderStatus: { $ne: 'Cancelled' } });

  const interestCategories = [];
  const excludedProductIds = [];

  if (user && user.wishlist) {
    user.wishlist.forEach((p) => {
      interestCategories.push(p.category);
      excludedProductIds.push(p._id.toString());
    });
  }

  orders.forEach((order) => {
    order.products.forEach((p) => {
      excludedProductIds.push(p.product.toString());
    });
  });

  // Populate categories from orders
  if (excludedProductIds.length > 0) {
    const purchasedProducts = await Product.find({ _id: { $in: excludedProductIds } });
    purchasedProducts.forEach((p) => {
      interestCategories.push(p.category);
    });
  }

  const uniqueCategories = [...new Set(interestCategories)];

  let recommendations;
  if (uniqueCategories.length > 0) {
    // Recommend top products in their interest categories, excluding already bought/wishlisted
    recommendations = await Product.find({
      category: { $in: uniqueCategories },
      _id: { $nin: excludedProductIds },
    })
      .sort({ ratings: -1 })
      .limit(6);
  } else {
    recommendations = [];
  }

  // Pad recommendations if we have fewer than 6
  if (recommendations.length < 6) {
    const existingIds = recommendations.map((r) => r._id.toString()).concat(excludedProductIds);
    const padding = await Product.find({ _id: { $nin: existingIds } })
      .sort({ ratings: -1 })
      .limit(6 - recommendations.length);
    recommendations.push(...padding);
  }

  res.json(recommendations);
});

module.exports = {
  getSimilarProducts,
  getPurchaseHistoryRecommendations,
  getWishlistRecommendations,
  getCustomersAlsoBought,
  getUserFeedRecommendations,
};
