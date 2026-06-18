import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, Truck, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { createPaymentIntent, submitOrder, resetCheckoutState } from '../redux/slices/orderSlice';
import { clearCart, clearCartDb } from '../redux/slices/cartSlice';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { paymentIntent, loading, error, successCheckout } = useSelector((state) => state.orders);

  // Form states
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment

  // Mock Card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Check if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !successCheckout) {
      navigate('/cart');
    }
  }, [cartItems, navigate, successCheckout]);

  // Handle successful checkout
  useEffect(() => {
    if (successCheckout) {
      dispatch(clearCart());
      dispatch(clearCartDb());
      const timer = setTimeout(() => {
        dispatch(resetCheckoutState());
        navigate('/orders');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successCheckout, dispatch, navigate]);

  // Calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price) * item.quantity,
    0
  );
  const shippingFee = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const totalAmount = subtotal + shippingFee + tax;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    // Dispatch payment intent creation
    const itemsList = cartItems.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    }));
    dispatch(createPaymentIntent(itemsList))
      .unwrap()
      .then(() => {
        setStep(2);
      })
      .catch(() => {});
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setPaymentLoading(true);

    // Simulate Stripe payment processing time
    setTimeout(() => {
      const orderProducts = cartItems.map((item) => ({
        product: item.product._id,
        title: item.product.title,
        quantity: item.quantity,
        price: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price,
        image: item.product.images[0],
      }));

      const orderData = {
        products: orderProducts,
        shippingAddress: { address, city, postalCode, country },
        paymentInfo: {
          id: paymentIntent?.isMock ? 'mock_txn_' + Math.random().toString(36).substr(2, 9) : 'stripe_txn_' + Math.random().toString(36).substr(2, 9),
          status: 'succeeded',
        },
        totalAmount,
      };

      dispatch(submitOrder(orderData))
        .unwrap()
        .then(() => {
          setPaymentLoading(false);
        })
        .catch(() => {
          setPaymentLoading(false);
        });
    }, 1500);
  };

  if (successCheckout) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-150">Payment Successful!</h2>
        <p className="text-xs text-gray-400">Your order has been dispatched. Redirecting to your Order History...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="text-left border-b border-gray-100 dark:border-darkBorder/40 pb-4">
        <h1 className="text-2xl font-black text-gray-850 dark:text-white m-0">Secure Checkout</h1>
        <p className="text-xs text-gray-400 mt-1">Complete your shipping and payment details</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Forms */}
        <div className="flex-1 w-full bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 md:p-8 shadow-sm text-left">
          
          {/* Step Indicators */}
          <div className="flex gap-4 mb-8">
            <div className={`flex-1 pb-2 border-b-2 text-center text-xs font-bold transition-all ${step === 1 ? 'border-brand-500 text-brand-500' : 'border-gray-200 text-gray-400'}`}>
              1. Delivery Address
            </div>
            <div className={`flex-1 pb-2 border-b-2 text-center text-xs font-bold transition-all ${step === 2 ? 'border-brand-500 text-brand-500' : 'border-gray-200 text-gray-400'}`}>
              2. Secure Payment
            </div>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-red-500/10 text-red-500 rounded-xl text-xs flex gap-2 items-center border border-red-500/20">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Shipping Details */}
          {step === 1 && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div className="flex gap-2 items-center text-gray-800 dark:text-gray-200 font-bold text-sm mb-4">
                <Truck size={18} /> Shipping Information
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-semibold">Street Address</label>
                <input
                  type="text"
                  placeholder="123 Main St, Apt 4"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">City</label>
                  <input
                    type="text"
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Postal Code</label>
                  <input
                    type="text"
                    placeholder="10001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Country</label>
                  <input
                    type="text"
                    placeholder="United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all mt-6 block text-center shadow-md shadow-brand-500/10"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
            </form>
          )}

          {/* STEP 2: Secure Payment */}
          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="flex justify-between items-center text-gray-800 dark:text-gray-200 font-bold text-sm mb-4">
                <span className="flex gap-2 items-center">
                  <CreditCard size={18} /> Card Details
                </span>
                {paymentIntent?.isMock && (
                  <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded-md font-bold">
                    Test Mode (Simulated Gateway)
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-semibold">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-semibold">Card Number</label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  maxLength="19"
                  required
                  className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value.replace(/\s?/g, '').replace(/(\d{2})/?/g, '$1/').replace(/\/$/, '').trim())}
                    maxLength="5"
                    required
                    className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">CVC</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    maxLength="3"
                    required
                    className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-50 dark:border-darkBorder/40 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full bg-gray-150 dark:bg-gray-800 text-gray-750 dark:text-gray-300 font-bold py-3.5 rounded-xl text-sm transition-colors text-center"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading || loading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-brand-500/10"
                >
                  <ShieldCheck size={18} />
                  {paymentLoading ? 'Processing Payment...' : `Pay $${totalAmount.toFixed(2)}`}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Order Details Cart Panel */}
        <div className="w-full lg:w-96 shrink-0 bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 shadow-sm text-left space-y-6">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-200 border-b border-gray-50 dark:border-darkBorder/40 pb-3 m-0">
            Order Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
          </h3>

          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {cartItems.map((item) => {
              const singlePrice = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
              return (
                <div key={item.product._id} className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                    <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-xs text-left">
                    <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{item.product.title}</p>
                    <p className="text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-100 shrink-0">
                    ${(singlePrice * item.quantity).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3 text-xs pt-4 border-t border-gray-50 dark:border-darkBorder/40">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-550 dark:text-gray-400">
              <span>Shipping Fee</span>
              <span className="font-bold">{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-550 dark:text-gray-400">
              <span>Sales Tax (8%)</span>
              <span className="font-bold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-800 dark:text-white border-t border-gray-55 dark:border-darkBorder/40 pt-3">
              <span>Grand Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
