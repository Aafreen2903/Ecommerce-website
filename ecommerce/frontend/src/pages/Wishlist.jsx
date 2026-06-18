import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { fetchWishlist } from '../redux/slices/wishlistSlice';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/LoadingSkeleton';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { wishlistItems, loading } = useSelector((state) => state.wishlist);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, userInfo]);

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
          <Heart size={28} fill="currentColor" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-150">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-400">Save products to your wishlist to see them here.</p>
        <Link to="/products" className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-left border-b border-gray-100 dark:border-darkBorder/40 pb-4">
        <h1 className="text-2xl font-black text-gray-850 dark:text-white m-0">My Wishlist</h1>
        <p className="text-xs text-gray-400 mt-1">Curated list of your favorite items</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
