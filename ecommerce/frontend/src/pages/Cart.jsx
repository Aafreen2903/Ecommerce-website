import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { removeFromCart, updateCartQty, syncCartWithDb, fetchCart } from '../redux/slices/cartSlice';



const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  React.useEffect(() => {
    if (userInfo) {
      dispatch(fetchCart());
    }
  }, [dispatch, userInfo]);
  const handleQtyChange = (id, quantity) => {
    if (quantity < 1) return;
    dispatch(updateCartQty({ id, qty: quantity }));
    
    if (userInfo) {
      const updated = cartItems.map(item =>
        item.product._id === id ? { ...item, quantity } : item
      );
      dispatch(syncCartWithDb(updated));
    }
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
    if (userInfo) {
      const updated = cartItems.filter(item => item.product._id !== id);
      dispatch(syncCartWithDb(updated));
    }
  };

  const handleCheckout = () => {
    if (!userInfo) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price) * item.quantity,
    0
  );
  const shippingFee = subtotal > 50 || subtotal === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const totalAmount = subtotal + shippingFee + tax;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto text-brand-500">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-150">Your Cart is Empty</h2>
        <p className="text-xs text-gray-400">Add products from the catalog to see them here.</p>
        <Link to="/products" className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-brand-500/10">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-left border-b border-gray-100 dark:border-darkBorder/40 pb-4">
        <h1 className="text-2xl font-black text-gray-850 dark:text-white m-0">Shopping Cart</h1>
        <p className="text-xs text-gray-400 mt-1">Review items selected for purchase</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Cart items list */}
        <div className="flex-1 w-full space-y-4">
          {cartItems.map((item) => {
            const hasDiscount = item.product.discountPrice > 0;
            const singlePrice = hasDiscount ? item.product.discountPrice : item.product.price;
            return (
              <div
                key={item.product._id}
                className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-2xl p-4 shadow-sm text-left w-full"
              >
                {/* Image */}
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0">
                  <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                </div>

                {/* Specs */}
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product._id}`}>
                    <h3 className="font-bold text-sm text-gray-800 dark:text-gray-150 truncate hover:text-brand-500 transition-colors">
                      {item.product.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{item.product.brand}</p>
                  <p className="text-xs text-emerald-500 font-semibold mt-1">
                    ${singlePrice.toFixed(2)} each
                  </p>
                </div>

                {/* Counter controls */}
                <div className="flex items-center gap-2 border border-gray-200 dark:border-darkBorder rounded-xl p-1 bg-gray-50 dark:bg-darkBg">
                  <button
                    onClick={() => handleQtyChange(item.product._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-extrabold w-8 text-center text-gray-800 dark:text-gray-200">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange(item.product._id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Price Total */}
                <div className="w-24 text-right shrink-0">
                  <span className="font-black text-sm text-gray-950 dark:text-white">
                    ${(singlePrice * item.quantity).toFixed(2)}
                  </span>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleRemove(item.product._id)}
                  className="p-2 border border-red-100 dark:border-red-500/15 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Calculator */}
        <div className="w-full lg:w-96 shrink-0 bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 shadow-sm text-left space-y-6">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-200 border-b border-gray-50 dark:border-darkBorder/40 pb-3 m-0">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-gray-550 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-550 dark:text-gray-400">
              <span>Shipping Fee</span>
              <span className="font-bold">
                {shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-550 dark:text-gray-400">
              <span>Sales Tax (8%)</span>
              <span className="font-bold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-800 dark:text-white border-t border-gray-50 dark:border-darkBorder/40 pt-3">
              <span>Total Price</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-brand-500/10"
          >
            Proceed to Checkout <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
