// src/routes/cartRoutes.js
const express = require('express');
const { getCart, syncCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // protect all cart routes

router.route('/')
  .get(getCart)
  .post(syncCart)
  .delete(clearCart);

module.exports = router;
