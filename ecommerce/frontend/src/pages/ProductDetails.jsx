import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Heart, ShoppingCart, MessageSquare, AlertCircle } from 'lucide-react';
import {
  fetchProductDetails,
  createReview,
  resetReviewState,
  fetchSimilarProducts,
  fetchAlsoBought,
  clearProductDetails,
} from '../redux/slices/productSlice';
import { addToCart, syncCartWithDb } from '../redux/slices/cartSlice';
import { toggleWishlistItem } from '../redux/slices/wishlistSlice';
import RecommendationCarousel from '../components/RecommendationCarousel';
import { ProductCardSkeleton } from '../components/LoadingSkeleton';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { productDetails: product, loading, error, reviewSuccess, reviewError, recommendations } = useSelector(
    (state) => state.products
  );
  const { userInfo } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { cartItems } = useSelector((state) => state.cart);

  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Fetch product on mount and clean up
  useEffect(() => {
    dispatch(fetchProductDetails(id));
    dispatch(fetchSimilarProducts(id));
    dispatch(fetchAlsoBought(id));

    return () => {
      dispatch(clearProductDetails());
      dispatch(resetReviewState());
    };
  }, [dispatch, id]);

  // Sync active image state
  useEffect(() => {
    if (product && product.images) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  // Handle successful review addition
  useEffect(() => {
    if (reviewSuccess) {
      setReviewComment('');
      setReviewRating(5);
      dispatch(resetReviewState());
    }
  }, [reviewSuccess, dispatch]);

  if (loading && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertCircle size={40} className="text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Failed to load details</h2>
        <p className="text-sm text-gray-400">{error}</p>
        <Link to="/products" className="inline-block bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const isWishlisted = wishlistItems.some((item) => item._id === product._id || item === product._id);
  const hasDiscount = product.discountPrice > 0;
  const activePrice = hasDiscount ? product.discountPrice : product.price;

  const handleWishlist = () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlistItem(product._id));
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    if (userInfo) {
      const updatedCart = [...cartItems];
      const index = updatedCart.findIndex(item => item.product._id === product._id);
      if (index > -1) {
        updatedCart[index] = { product, quantity: updatedCart[index].quantity + quantity };
      } else {
        updatedCart.push({ product, quantity });
      }
      dispatch(syncCartWithDb(updatedCart));
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!userInfo) {
      navigate('/login');
      return;
    }
    dispatch(
      createReview({
        productId: product._id,
        review: { rating: reviewRating, comment: reviewComment },
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Product Display Details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* Media Gallery */}
        <div className="space-y-4">
          <div className="h-96 w-full rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden relative">
            <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
            <button
              onClick={handleWishlist}
              className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md backdrop-blur-md transition-colors ${
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 dark:bg-slate-900/90 text-gray-650 dark:text-gray-300 hover:text-red-500'
              }`}
              aria-label="Add to wishlist"
            >
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImage === img ? 'border-brand-500 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Specs & Purchase Actions */}
        <div className="flex flex-col text-left space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-500 bg-brand-500/10 px-2.5 py-1 rounded-md">
                {product.category}
              </span>
              <span className="text-xs text-gray-400 font-bold">{product.brand}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-850 dark:text-white leading-tight m-0">
              {product.title}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                <Star size={18} fill="currentColor" />
                <span className="text-sm font-bold ml-1 text-gray-700 dark:text-gray-300">
                  {product.ratings.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-gray-400">({product.numReviews} ratings)</span>
            </div>
          </div>

          <div className="py-4 border-t border-b border-gray-100 dark:border-darkBorder/40 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Price</p>
              {hasDiscount ? (
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    ${product.discountPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-405 dark:text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-black text-gray-900 dark:text-white mt-1 block">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            <div>
              {product.stock === 0 ? (
                <span className="bg-red-500/10 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full border border-red-500/20">
                  Out of Stock
                </span>
              ) : (
                <span className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/20">
                  In Stock ({product.stock} units available)
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-550 dark:text-gray-400 leading-relaxed font-normal">
            {product.description}
          </p>

          {/* Action Row */}
          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4 mt-auto">
              <div className="w-full sm:w-28 shrink-0 flex flex-col gap-1.5">
                <span className="text-xs text-gray-400 font-semibold">Qty</span>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-250 focus:outline-none"
                >
                  {[...Array(Math.min(10, product.stock)).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <span className="text-xs text-transparent select-none hidden sm:block">Action</span>
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-brand-500/20 shadow-brand-500/10"
                >
                  <ShoppingCart size={18} /> Add to Shopping Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AI Recommendations Carousels */}
      <section className="space-y-4">
        <RecommendationCarousel products={recommendations.similar} title="Similar Products You May Like" />
        <RecommendationCarousel products={recommendations.alsoBought} title="Customers Also Bought" />
      </section>

      {/* Reviews Logs and Form */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Rating Summary Breakdown */}
        <div className="space-y-4 text-left">
          <h3 className="text-lg font-black text-gray-800 dark:text-gray-150 flex items-center gap-2">
            <MessageSquare size={18} /> Reviews
          </h3>
          <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <p className="text-5xl font-black text-gray-950 dark:text-white">{product.ratings.toFixed(1)}</p>
            <div className="flex text-amber-500 mt-2 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.round(product.ratings) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">Based on {product.numReviews} customer reviews</p>
          </div>
        </div>

        {/* Comments Log */}
        <div className="md:col-span-2 space-y-6 text-left">
          <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 shadow-sm space-y-6">
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 border-b border-gray-50 dark:border-darkBorder/40 pb-3 m-0">
              Customer Feedbacks
            </h4>
            {product.reviews.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No reviews written for this product yet.</p>
            ) : (
              <div className="space-y-6 divide-y divide-gray-50 dark:divide-darkBorder/40">
                {product.reviews.map((r, i) => (
                  <div key={r._id} className={`pt-4 ${i === 0 ? 'pt-0' : ''}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{r.name}</span>
                      <span className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex text-amber-500 mb-2">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} size={12} fill={idx < r.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-450 leading-relaxed font-normal">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a review Form */}
          {userInfo ? (
            <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 shadow-sm">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-4 m-0">Write a Review</h4>
              {reviewError && (
                <div className="p-3 mb-4 bg-red-500/10 text-red-500 rounded-xl text-xs flex gap-2 border border-red-500/20">
                  <span>{reviewError}</span>
                </div>
              )}
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-250 focus:outline-none w-28"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} Star{n > 1 && 's'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Comment</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your experience with this product..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    className="bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-brand-500/10"
                >
                  Submit Review
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-[#131a29] border border-gray-150 dark:border-darkBorder rounded-3xl p-6 text-center space-y-2">
              <p className="text-xs text-gray-450">You must be logged in to write a product review.</p>
              <Link
                to="/login"
                className="inline-block text-xs font-bold text-brand-500 hover:text-brand-650 transition-all"
              >
                Log In Here
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
