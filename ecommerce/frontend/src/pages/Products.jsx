import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SlidersHorizontal, Star, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/LoadingSkeleton';

const Products = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const {
  products = [],
  loading = false,
  categories = [],
  brands = [],
  page = 1,
  pages = 1,
  total = 0,
} = useSelector((state) => state.products || {});

  // Read query params from URL
  const queryParams = new URLSearchParams(location.search);
  const urlKeyword = queryParams.get('keyword') || '';
  const urlCategory = queryParams.get('category') || '';
  const urlBrand = queryParams.get('brand') || '';
  const urlMinPrice = queryParams.get('minPrice') || '';
  const urlMaxPrice = queryParams.get('maxPrice') || '';
  const urlRatings = queryParams.get('ratings') || '';
  const urlSortBy = queryParams.get('sortBy') || '';
  const urlPage = Number(queryParams.get('page')) || 1;

  // Filter States
  const [minPrice, setMinPrice] = useState(urlMinPrice);
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);

  // Fetch products when URL changes
  useEffect(() => {
    dispatch(
      fetchProducts({
        keyword: urlKeyword,
        category: urlCategory,
        brand: urlBrand,
        minPrice: urlMinPrice,
        maxPrice: urlMaxPrice,
        ratings: urlRatings,
        page: urlPage,
        sortBy: urlSortBy,
      })
    );
  }, [dispatch, location.search]);

  // Sync inputs on back/forward or navigation
  useEffect(() => {
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);
  }, [urlMinPrice, urlMaxPrice]);

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(location.search);
    
    // Always reset page to 1 when changing filters
    params.set('page', '1');

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    navigate(`/products?${params.toString()}`);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateFilters({ minPrice, maxPrice });
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    navigate('/products');
  };

  const handleSortChange = (e) => {
    updateFilters({ sortBy: e.target.value });
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    navigate(`/products?${params.toString()}`);
  };
  
  console.log("Redux Products State:", {
  products,
  categories,
  brands,
  loading,
});
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Filters Panel */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-150 dark:border-darkBorder">
            <h3 className="font-extrabold text-base text-slate-900 font-bold dark:text-gray-200 font-bold flex items-center gap-2">
              <SlidersHorizontal size={18} /> Filters
            </h3>
            {(urlCategory || urlBrand || urlMinPrice || urlMaxPrice || urlRatings || urlKeyword) && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-red-500 font-bold hover:text-red-600 font-bold transition-colors flex items-center gap-1"
              >
                <Trash2 size={13} /> Reset
              </button>
            )}
          </div>

          {/* Search details summary */}
          {urlKeyword && (
            <div className="p-3 bg-brand-500/5 border border-brand-500/15 rounded-xl text-left">
              <p className="text-xs text-gray-400 font-bold">Searching for</p>
              <p className="text-sm font-bold text-slate-900 font-bold dark:text-gray-200font-bold  truncate mt-0.5">"{urlKeyword}"</p>
            </div>
          )}

          {/* Categories Filter */}
          <div className="space-y-3 text-left">
            <h4 className="font-bold text-sm text-slate-900 font-bold dark:text-gray-200 font-bold">Category</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {(categories || []).map((c) => (
                <button
                  key={c}
                  onClick={() => updateFilters({ category: urlCategory === c ? '' : c })}
                  className={`block text-xs font-medium text-left w-full px-2 py-1.5 rounded-lg transition-colors ${
                    urlCategory === c
                      ? 'bg-brand-500 text-white font-semibold'
                      : 'text-gray-650 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 text-left">
            <h4 className="font-bold text-sm text-slate-900 font-bold dark:text-gray-200 font-sans">Price Range ($)</h4>
            <form onSubmit={handlePriceApply} className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-gray-50 dark:bg-darkCard border border-gray-250 dark:border-darkBorder rounded-lg px-2 py-1 text-xs text-gray-850 dark:text-gray-200 focus:outline-none"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-gray-50 dark:bg-darkCard border border-gray-250 dark:border-darkBorder rounded-lg px-2 py-1 text-xs text-gray-850 dark:text-gray-200 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg transition-colors"
              >
                Go
              </button>
            </form>
          </div>

          {/* Brands Filter */}
          <div className="space-y-3 text-left">
            <h4 className="font-bold text-sm text-slate-900 font-bold dark:text-gray-200 font-sans">Brand</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
             {(brands || []).map((b) => (
                <button
                  key={b}
                  onClick={() => updateFilters({ brand: urlBrand === b ? '' : b })}
                  className={`block text-xs font-medium text-left w-full px-2 py-1.5 rounded-lg transition-colors ${
                    urlBrand === b
                      ? 'bg-brand-500 text-white font-semibold'
                      : 'text-gray-650 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Ratings Filter */}
          <div className="space-y-3 text-left">
            <h4 className="font-bold text-sm text-slate-900 font-bold dark:text-gray-200">Rating</h4>
            <div className="space-y-1">
              {[4, 3, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => updateFilters({ ratings: urlRatings === num.toString() ? '' : num.toString() })}
                  className={`flex items-center gap-1.5 w-full text-xs px-2 py-1.5 rounded-lg text-left transition-colors ${
                    urlRatings === num.toString()
                      ? 'bg-brand-500 text-white font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <Star size={13} fill="currentColor" className="text-amber-500 shrink-0" />
                  <span>{num}★ & above</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Catalog View */}
        <main className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-gray-150 dark:border-darkBorder">
            <div className="text-left">
              <h2 className="text-xl font-extrabold text-slate-900 font-bold dark:text-white m-0">Catalog</h2>
              <p className="text-xs text-gray-400 mt-1">Found {total} matches</p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-gray-400 font-bold shrink-0">Sort By:</span>
              <select
                value={urlSortBy}
                onChange={handleSortChange}
                className="bg-white dark:bg-darkCard border border-gray-250 dark:border-darkBorder rounded-lg px-2 py-1.5 text-xs text-slate-900 font-bold dark:text-gray-250 focus:outline-none"
              >
                <option value="">Latest Arrival</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : (products || []).length === 0 ? (
            <div className="py-20 text-center space-y-2 border border-dashed border-gray-200 dark:border-darkBorder rounded-3xl">
              <p className="text-gray-850 dark:text-gray-300 font-bold text-lg">No matches found</p>
              <p className="text-gray-400 text-xs">Try clearing filters or search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(products || []).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="p-2 border border-gray-200 dark:border-darkBorder rounded-lg bg-white dark:bg-darkCard hover:bg-gray-50 text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:hover:bg-white"
                aria-label="Previous Page"
              >
                <ArrowLeft size={16} />
              </button>
              
              {Array.from({ length: pages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      page === pageNum
                        ? 'bg-brand-500 text-white'
                        : 'border border-gray-200 dark:border-darkBorder bg-white dark:bg-darkCard text-gray-650 hover:bg-gray-50 dark:text-gray-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={page === pages}
                onClick={() => handlePageChange(page + 1)}
                className="p-2 border border-gray-200 dark:border-darkBorder rounded-lg bg-white dark:bg-darkCard hover:bg-gray-50 text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:hover:bg-white"
                aria-label="Next Page"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
