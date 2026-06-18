import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-gray-50 dark:bg-[#080b12] border-t border-gray-150 dark:border-darkBorder transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand section */}
          <div className="space-y-4">
            <span className="text-xl font-black bg-gradient-to-r from-brand-500 to-indigo-600 bg-clip-text text-transparent">
              AxoraShop
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Experience the best online shopping with ultra-fast deliveries, secure Stripe transactions, and intelligent product matching powered by our AI recommendation engine.
            </p>
          </div>

          {/* Customer Support Links */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wider">
              Customer Service
            </h4>
            <ul className="space-y-2 text-xs text-gray-550 dark:text-gray-400">
              <li><a href="#" className="hover:text-brand-500 transition-colors">Help Center / FAQs</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wider">
              Popular Categories
            </h4>
            <ul className="space-y-2 text-xs text-gray-550 dark:text-gray-400">
              <li><a href="#" className="hover:text-brand-500 transition-colors">Consumer Electronics</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Home & Office Furniture</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Sports & Outdoors</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Bags & Wallets</a></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
              Subscribe to Newsletter
            </h4>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full bg-white dark:bg-darkCard border border-gray-250 dark:border-darkBorder rounded-l-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button className="bg-brand-500 hover:bg-brand-600 text-white px-3 text-xs font-bold rounded-r-xl transition-colors shrink-0">
                Join
              </button>
            </div>
            <div className="flex gap-3 text-gray-400 dark:text-gray-500">
              <a href="#" className="hover:text-brand-500 transition-colors">Github</a>
              <a href="#" className="hover:text-brand-500 transition-colors">Twitter</a>
              <a href="#" className="hover:text-brand-500 transition-colors">Linkedin</a>
              <a href="#" className="hover:text-brand-500 transition-colors">Mail</a>
            </div>
          </div>
        </div>

        {/* Copyright divider */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-darkBorder/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {currentYear} AxoraShop E-Commerce Platform. All rights reserved.</p>
          <p>
  Built with ❤️ 
</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
