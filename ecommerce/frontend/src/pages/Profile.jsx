import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Lock, ShieldAlert, CheckCircle } from 'lucide-react';
import { updateProfile, clearAuthError } from '../redux/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [valError, setValError] = useState('');

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
    return () => {
      dispatch(clearAuthError());
    };
  }, [userInfo, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValError('');
    setSuccess(false);

    if (password && password !== confirmPassword) {
      setValError('Passwords do not match');
      return;
    }

    const updateData = { name, email };
    if (password) {
      updateData.password = password;
    }

    dispatch(updateProfile(updateData))
      .unwrap()
      .then(() => {
        setSuccess(true);
        setPassword('');
        setConfirmPassword('');
      })
      .catch(() => {});
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 md:p-8 shadow-sm text-left">
        <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white mb-6 border-b border-gray-50 dark:border-darkBorder/40 pb-4 flex items-center gap-2">
          <User size={22} className="text-brand-500" /> Personal Account Details
        </h2>

        {success && (
          <div className="p-3 mb-4 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs flex gap-2 items-center border border-emerald-500/20">
            <CheckCircle size={15} className="shrink-0" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {(error || valError) && (
          <div className="p-3 mb-4 bg-red-500/10 text-red-500 rounded-xl text-xs flex gap-2 items-center border border-red-500/20">
            <ShieldAlert size={15} className="shrink-0" />
            <span>{valError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-semibold">Full Name</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={16} />
              </span>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-450 dark:text-gray-400 font-semibold">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-450 dark:text-gray-400 font-semibold">New Password (optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-450 dark:text-gray-400 font-semibold">Confirm Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20"
            >
              {loading ? 'Updating Details...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
