import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { addToCart, syncCartWithDb } from '../redux/slices/cartSlice';
import { toggleWishlistItem } from '../redux/slices/wishlistSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { cartItems } = useSelector((state) => state.cart);

  const isWishlisted = wishlistItems.some((id) => id._id === product._id || id === product._id);
  const hasDiscount = product.discountPrice > 0;
  const activePrice = hasDiscount ? product.discountPrice : product.price;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userInfo) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlistItem(product._id));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add locally
    dispatch(addToCart({ product, quantity: 1 }));
    
    // Sync with database if logged in
    if (userInfo) {
      const updatedCart = [...cartItems, { product, quantity: 1 }];
      dispatch(syncCartWithDb(updatedCart));
    }
  };

  return (
    <div className="group relative bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-2xl p-4 flex flex-col h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="block relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800 mb-4 h-48">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition-colors ${
            isWishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/80 dark:bg-slate-900/80 text-gray-600 dark:text-gray-300 hover:text-red-500'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute bottom-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </span>
        )}
      </Link>

      {/* Category & Brand */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">
          {product.category}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          {product.brand}
        </span>
      </div>

      {/* Title */}
      <Link to={`/products/${product._id}`} className="block mb-2">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base line-clamp-1 group-hover:text-brand-500 transition-colors">
          {product.title}
        </h3>
      </Link>

      {/* Ratings & Stock */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="flex items-center text-amber-500">
          <Star size={16} fill="currentColor" />
          <span className="text-sm font-bold ml-1 text-gray-700 dark:text-gray-300">
            {product.ratings.toFixed(1)}
          </span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          ({product.numReviews} reviews)
        </span>
        {product.stock === 0 ? (
          <span className="ml-auto text-xs text-red-500 font-semibold">Out of Stock</span>
        ) : product.stock < 5 ? (
          <span className="ml-auto text-xs text-amber-500 font-semibold">Only {product.stock} left</span>
        ) : null}
      </div>

      {/* Pricing & Add to Cart */}
      <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-50 dark:border-darkBorder/30">
        <div>
          {hasDiscount ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                ${product.discountPrice.toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                ${product.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-extrabold text-gray-900 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
            product.stock === 0
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'bg-brand-500 hover:bg-brand-600 text-white shadow-md hover:shadow-brand-500/20 shadow-brand-500/10'
          }`}
          aria-label="Add to cart"
        >
          <ShoppingCart size={15} />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
