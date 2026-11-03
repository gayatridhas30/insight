import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { adminService } from '../../api/services';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await adminService.getAllUsers(params);
      if (res.data?.success) setUsers(res.data.users || []);
    } catch (err) {
      console.warn('Users fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      fetchUsers();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-navy">
          User Management Directory
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          Manage platform accounts, role assignments, and suspension status
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-charcoal/10 shadow-subtle flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchUsers();
          }}
          className="relative w-full sm:w-80"
        >
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-xs font-semibold rounded-xl border border-charcoal/15 bg-ivory-50 text-charcoal"
        >
          <option value="">All Roles</option>
          <option value="admin">Administrator</option>
          <option value="host">Host / Organizer</option>
          <option value="participant">Participant</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm font-semibold text-navy">
          <RefreshCw size={20} className="animate-spin text-coral mr-2" />
          <span>Loading user accounts...</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-charcoal/10 shadow-subtle overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory border-b border-charcoal/10 text-charcoal/70 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-ivory/50">
                  <td className="py-3.5 px-4 font-bold text-navy">{u.name}</td>
                  <td className="py-3.5 px-4 text-charcoal/70">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-lavender text-navy'
                          : 'bg-coral/10 text-coral'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        u.isActive ? 'text-sage-dark' : 'text-coral'
                      }`}
                    >
                      {u.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      <span>{u.isActive ? 'Active' : 'Suspended'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-charcoal/50">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u._id)}
                      className="px-2.5 py-1 rounded-lg border border-charcoal/15 font-bold hover:bg-navy hover:text-white transition-colors"
                    >
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
