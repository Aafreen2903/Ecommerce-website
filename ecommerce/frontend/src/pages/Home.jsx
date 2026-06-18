import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { fetchProducts, fetchUserFeed } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';
import RecommendationCarousel from '../components/RecommendationCarousel';
import { ProductCardSkeleton } from '../components/LoadingSkeleton';

const categoriesList = [
{
name: 'Electronics',
image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'
},
{
name: 'Home & Kitchen',
image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&auto=format&fit=crop&q=60'
},
{
name: 'Women Accessories',
image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60'
},
{
name: 'Fitness & Outdoors',
image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=60'
},
];


const Home = () => {
  const dispatch = useDispatch();

  const {
    products = [],
    loading = false,
    recommendations = { userFeed: [] },
  } = useSelector((state) => state.products || {});

  const { userInfo } = useSelector((state) => state.auth || {});

  useEffect(() => {
    dispatch(fetchProducts({ pageSize: 4 }));
    dispatch(fetchUserFeed());
  }, [dispatch]);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-8 md:gap-16 text-white shadow-xl mt-4 mx-4">
        {/* Background glow animations */}
        <div className="absolute -left-16 -top-16 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="flex-1 space-y-6 text-left relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/25 border border-brand-500/30 text-brand-300">
            <ShoppingBag size={13} /> Summer Electronics Sale
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight m-0 text-white">
            Level Up Your <br />
            <span className="bg-gradient-to-r from-brand-300 to-indigo-400 bg-clip-text text-transparent">Digital Lifestyle</span>
          </h1>
          <p className="text-sm md:text-base text-slate-350 max-w-lg leading-relaxed">
            Discover precision wireless audio, immersive smart gear, and high-productivity office accessories at unbeatable rates.
          </p>
          <div className="flex gap-4">
            <Link
              to="/products"
              className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
            >
              Shop Collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="flex-1 relative max-w-sm md:max-w-md shrink-0">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
            alt="Featured Headphones"
            className="w-full object-contain filter drop-shadow-[0_20px_50px_rgba(92,115,255,0.3)] rounded-2xl transform rotate-3"
          />
        </div>
      </section>

      {/* Feature Value Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {[
          { icon: <Truck className="text-brand-500" size={24} />, title: 'Free Global Shipping', desc: 'Orders above $50' },
          { icon: <ShieldCheck className="text-brand-500" size={24} />, title: 'Secured Checkout', desc: 'Stripe encrypted checkout' },
          { icon: <RefreshCw className="text-brand-500" size={24} />, title: 'Easy 30-Day Returns', desc: 'No questions asked return' },
          { icon: <ShoppingBag className="text-brand-500" size={24} />, title: 'AI Personalized Deals', desc: 'Smarter recommendations' },
        ].map((f, i) => (
          <div key={i} className="flex gap-3 items-start p-4 bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-2xl shadow-sm text-left">
            <div className="p-2.5 bg-brand-500/10 dark:bg-brand-500/20 rounded-xl shrink-0">
              {f.icon}
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{f.title}</h4>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* AI Recommendations Module */}
      <section className="max-w-7xl mx-auto px-4">
        <RecommendationCarousel
  products={recommendations?.userFeed || []}
  title={userInfo ? 'Recommended For You' : 'Trending Now'}
/>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="text-left">
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white">Shop by Category</h2>
          <p className="text-xs text-gray-400 mt-1">Explore our wide selection of premium curated goods</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categoriesList.map((c, i) => (
            <Link
              key={i}
              to={`/products?category=${encodeURIComponent(c.name)}`}
              className="group relative h-40 rounded-2xl overflow-hidden shadow-sm"
            >
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-white text-base font-extrabold">{c.name}</span>
                <span className="text-white/60 text-xs font-semibold mt-0.5 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View Items <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex justify-between items-end">
          <div className="text-left">
            <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white">Featured Products</h2>
            <p className="text-xs text-gray-400 mt-1">Top picks and seasonal highlights</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1"
          >
            See All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
  {loading
    ? Array.from({ length: 4 }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))
    : (products || []).map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
</div>
      </section>
    </div>
  );
};

export default Home;
