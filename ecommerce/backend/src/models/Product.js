// src/models/Product.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, default: 0, min: 0 },
  images: [{ type: String, required: true }], // array of image URLs
  stock: { type: Number, required: true, default: 0, min: 0 },
  ratings: { type: Number, default: 0 }, // average rating
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
}, { timestamps: true });

// Text index for search
productSchema.index({ title: 'text', description: 'text', category: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
