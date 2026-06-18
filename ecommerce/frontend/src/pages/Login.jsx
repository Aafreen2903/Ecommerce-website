import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { login, clearAuthError } from '../redux/slices/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  // Parse redirect path if exists (e.g. from checkout)
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    // If logged in, send to redirect destination
    if (userInfo) {
      navigate(redirect);
    }
    return () => {
      dispatch(clearAuthError());
    };
  }, [userInfo, navigate, redirect, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 md:p-8 shadow-xl space-y-6 text-left relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute -left-12 -top-12 w-36 h-36 bg-brand-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -right-12 -bottom-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl"></div>

        <div className="text-center relative z-10">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white m-0">Welcome Back</h2>
          <p className="text-xs text-gray-400 mt-1.5">Enter credentials to access your account</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-xs flex gap-2 items-center border border-red-500/20 relative z-10">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-450 dark:text-gray-400 font-semibold">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-450 dark:text-gray-400 font-semibold">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-brand-500/10 mt-6"
          >
            <LogIn size={16} />
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-450 border-t border-gray-50 dark:border-darkBorder/40 pt-4 relative z-10">
          <span>New to MERNShop? </span>
          <Link
            to={`/register?redirect=${encodeURIComponent(redirect)}`}
            className="font-bold text-brand-500 hover:text-brand-600 transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
