import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

const RecommendationCarousel = ({ products = [], title }) => {
  const scrollContainerRef = useRef(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction) => {
    const { current } = scrollContainerRef;
    if (current) {
      const scrollAmount = 300;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };
   if (!Array.isArray(products)) {
  products = [];
}
  return (
    <div className="my-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 border border-gray-200 dark:border-darkBorder rounded-full bg-white dark:bg-darkCard hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors shadow-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 border border-gray-200 dark:border-darkBorder rounded-full bg-white dark:bg-darkCard hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors shadow-sm"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((product) => (
          <div
            key={product._id}
            className="w-[280px] shrink-0 scroll-snap-align-start"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationCarousel;
