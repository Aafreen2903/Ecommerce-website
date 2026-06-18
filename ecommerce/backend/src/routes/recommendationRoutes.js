// src/routes/recommendationRoutes.js
const express = require('express');
const {
  getSimilarProducts,
  getPurchaseHistoryRecommendations,
  getWishlistRecommendations,
  getCustomersAlsoBought,
  getUserFeedRecommendations,
} = require('../controllers/recommendationController');
const { protect, optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.route('/similar/:productId')
  .get(getSimilarProducts);

router.route('/also-bought/:productId')
  .get(getCustomersAlsoBought);

router.route('/purchase-history')
  .get(protect, getPurchaseHistoryRecommendations);

router.route('/wishlist')
  .get(protect, getWishlistRecommendations);

router.route('/user-feed')
  .get(optionalProtect, getUserFeedRecommendations);

module.exports = router;
