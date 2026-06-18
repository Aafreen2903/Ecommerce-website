// src/controllers/productController.js
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all products with searching, filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 8;
  const page = Number(req.query.page) || 1;

  // Search keyword
  const keyword = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
          { category: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  // Category filter
  const category = req.query.category ? { category: req.query.category } : {};

  // Brand filter
  const brand = req.query.brand ? { brand: req.query.brand } : {};

  // Price range filter
  let priceFilter = {};
  if (req.query.minPrice || req.query.maxPrice) {
    priceFilter.price = {};
    if (req.query.minPrice) priceFilter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) priceFilter.price.$lte = Number(req.query.maxPrice);
  }

  // Rating filter
  const ratings = req.query.ratings ? { ratings: { $gte: Number(req.query.ratings) } } : {};

  // Combine query filters
  const filterQuery = { ...keyword, ...category, ...brand, ...priceFilter, ...ratings };

  const count = await Product.countDocuments(filterQuery);

  // Sorting
  let sortQuery = { createdAt: -1 }; // default: latest
  if (req.query.sortBy) {
    if (req.query.sortBy === 'priceAsc') sortQuery = { price: 1 };
    else if (req.query.sortBy === 'priceDesc') sortQuery = { price: -1 };
    else if (req.query.sortBy === 'rating') sortQuery = { ratings: -1 };
  }

  const products = await Product.find(filterQuery)
    .sort(sortQuery)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  // Extract unique categories and brands for filter choices on frontend
  const allCategories = await Product.distinct('category');
  const allBrands = await Product.distinct('brand');

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
    categories: allCategories,
    brands: allBrands,
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added successfully', product });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, category, brand, price, discountPrice, stock, images } = req.body;

  const product = new Product({
    title: title || 'Sample Product',
    price: price || 0,
    discountPrice: discountPrice || 0,
    user: req.user._id,
    images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
    brand: brand || 'Sample Brand',
    category: category || 'Sample Category',
    stock: stock || 0,
    description: description || 'Sample Description',
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { title, description, category, brand, price, discountPrice, stock, images } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.title = title || product.title;
    product.description = description || product.description;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.price = price !== undefined ? price : product.price;
    product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
    product.stock = stock !== undefined ? stock : product.stock;
    if (images) product.images = images;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed successfully' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = {
  getProducts,
  getProductById,
  createProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
};
