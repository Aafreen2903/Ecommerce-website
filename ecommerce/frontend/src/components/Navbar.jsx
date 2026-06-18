import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Heart, User, LogOut, Search, Menu, X, Shield } from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import { fetchWishlist, clearWishlist } from '../redux/slices/wishlistSlice';
import { fetchCart, clearCart } from '../redux/slices/cartSlice';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [keyword, setKeyword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  // Sync details on login/logout
  useEffect(() => {
    if (userInfo) {
      dispatch(fetchWishlist());
      dispatch(fetchCart());
    } else {
      dispatch(clearWishlist());
    }
  }, [userInfo, dispatch]);

  // Sync search keyword from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get('keyword') || '');
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(keyword)}`);
    } else {
      navigate('/products');
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearWishlist());
    dispatch(clearCart());
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-darkBg/95 backdrop-blur-md border-b border-gray-100 dark:border-darkBorder transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-500 to-indigo-600 bg-clip-text text-transparent">
              AxoraShop
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-gray-50 dark:bg-darkCard border border-gray-250 dark:border-darkBorder rounded-xl pl-4 pr-10 py-2 text-sm text-gray-800 dark:text-gray-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500 transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Right Action Icons */}
         <div className="hidden md:flex items-center gap-4">

  <Link
    to="/"
    className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
  >
    Home
  </Link>

  <Link
    to="/products"
    className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
  >
    Browse
  </Link>

            {/* Theme Switcher */}
            <ThemeToggle />

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full scale-90">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {totalCartQty > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-brand-500 rounded-full scale-90">
                  {totalCartQty}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors focus:outline-none"
                aria-label="User account options"
              >
                <div className="w-8 h-8 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center border border-brand-500/20">
                  <User size={16} />
                </div>
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder shadow-lg py-1 z-20">
                    {userInfo ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-50 dark:border-darkBorder/40">
                          <p className="text-xs text-gray-400">Signed in as</p>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{userInfo.name}</p>
                        </div>
                        
                        {userInfo.role === 'admin' ? (
                          <>
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-500 transition-colors"
                            >
                              <Shield size={16} />
                              Admin Panel
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/profile"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-500 transition-colors"
                            >
                              <User size={16} />
                              My Profile
                            </Link>
                            <Link
                              to="/orders"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-500 transition-colors"
                            >
                              History
                            </Link>
                          </>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-gray-55 dark:border-darkBorder/30"
                        >
                          <LogOut size={16} />
                          Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                        >
                          Log In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-brand-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-bold"
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-darkBorder bg-white dark:bg-darkBg px-4 pt-2 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative mt-2">
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-gray-50 dark:bg-darkCard border border-gray-250 dark:border-darkBorder rounded-xl pl-4 pr-10 py-2 text-sm text-gray-800 dark:text-gray-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </form>

          <div className="space-y-1">

  <Link
    to="/"
    onClick={() => setMobileMenuOpen(false)}
    className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-500"
  >
    Home
  </Link>

  <Link
    to="/products"
    onClick={() => setMobileMenuOpen(false)}
    className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-500"
  >
    Browse Products
  </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex justify-between items-center px-3 py-2 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span>My Wishlist</span>
              {wishlistItems.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex justify-between items-center px-3 py-2 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span>My Shopping Cart</span>
              {totalCartQty > 0 && (
                <span className="bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalCartQty}
                </span>
              )}
            </Link>
          </div>

          <div className="pt-4 border-t border-gray-50 dark:border-darkBorder/40">
            {userInfo ? (
              <div className="space-y-1">
                <div className="px-3 pb-2">
                  <p className="text-xs text-gray-400">Logged in as</p>
                  <p className="text-sm font-bold text-gray-850 dark:text-gray-200">{userInfo.name}</p>
                </div>
                {userInfo.role === 'admin' ? (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Shield size={16} />
                    Admin Panel
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Order History
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 border border-gray-200 dark:border-darkBorder rounded-xl text-sm font-semibold text-gray-750 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 bg-brand-500 rounded-xl text-sm font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-600"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
