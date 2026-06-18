import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldAlert, UserCheck, UserX, Trash2 } from 'lucide-react';
import { fetchUsers, toggleBlockUser, deleteUser } from '../redux/slices/adminSlice';
import { TableRowSkeleton } from '../components/LoadingSkeleton';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleBlockToggle = (id, currentBlockStatus) => {
    dispatch(toggleBlockUser({ id, isBlocked: !currentBlockStatus }));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
      dispatch(deleteUser(id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="text-left border-b border-gray-150 dark:border-darkBorder/40 pb-4">
        <h1 className="text-2xl font-black text-gray-850 dark:text-white m-0">Manage Users</h1>
        <p className="text-xs text-gray-400 mt-1">Manage user registrations and access control rights</p>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-500/10 text-red-500 rounded-xl text-xs flex gap-2 items-center border border-red-500/20 text-left">
          <ShieldAlert size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Users lists Table */}
      <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 shadow-sm overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-darkBorder/40 text-gray-450 dark:text-gray-400 text-left font-bold uppercase tracking-wider">
                <th className="p-3">User ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-darkBorder/20">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              ) : (
                users.map((user) => {
                  const isAdmin = user.role === 'admin';
                  return (
                    <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-darkBg/10">
                      <td className="p-3 font-mono text-[10px] text-gray-500">{user._id}</td>
                      <td className="p-3 font-bold text-gray-800 dark:text-gray-250">{user.name}</td>
                      <td className="p-3 text-gray-450">{user.email}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isAdmin ? 'text-indigo-500 bg-indigo-500/10 border border-indigo-500/20' : 'text-gray-500 bg-gray-500/10 border border-gray-500/25'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        {user.isBlocked ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-500">Blocked</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">Active</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {!isAdmin && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                              className={`p-2 rounded-lg border transition-colors ${user.isBlocked ? 'border-emerald-100 hover:bg-emerald-50 text-emerald-500 dark:border-emerald-500/15 dark:hover:bg-emerald-500/10' : 'border-amber-100 hover:bg-amber-50 text-amber-500 dark:border-amber-500/15 dark:hover:bg-amber-500/10'}`}
                              aria-label={user.isBlocked ? 'Unblock user' : 'Block user'}
                            >
                              {user.isBlocked ? <UserCheck size={14} /> : <UserX size={14} />}
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="p-2 border border-red-100 rounded-lg hover:bg-red-50 text-red-500 dark:border-red-500/15 dark:hover:bg-red-500/10"
                              aria-label="Delete user"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
