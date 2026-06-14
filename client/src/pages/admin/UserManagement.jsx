import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { Users, Trash2, ShieldAlert, Award } from 'lucide-react';

const UserManagement = () => {
  const queryClient = useQueryClient();

  // Fetch users list
  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data;
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      const res = await api.put(`/admin/users/${userId}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      alert('User role updated successfully.');
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await api.delete(`/admin/users/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      alert('User deleted successfully.');
    }
  });

  const handleRoleChange = (userId, role) => {
    updateRoleMutation.mutate({ userId, role });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user account?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500 text-xs">Loading platform directory database...</div>;
  }

  const users = data?.users || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center space-x-2">
          <Users className="text-indigo-400" size={24} />
          <span>User Directory Management</span>
        </h1>
        <p className="text-xs text-textMuted mt-1">Manage user roles, elevate access rights, and terminate accounts</p>
      </div>

      {/* Directory Table */}
      <div className="glass-panel border border-darkBorder rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="text-[10px] uppercase text-slate-500 font-bold border-b border-darkBorder/40">
              <tr>
                <th scope="col" className="py-3">Name</th>
                <th scope="col" className="py-3">Email</th>
                <th scope="col" className="py-3">Role</th>
                <th scope="col" className="py-3">Verification status</th>
                <th scope="col" className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-darkBorder/20 hover:bg-slate-900/10">
                  <td className="py-3.5 font-bold text-slate-800">{u.name}</td>
                  <td className="py-3.5 text-slate-400">{u.email}</td>
                  <td className="py-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="bg-white border border-darkBorder rounded px-2 py-1 text-[11px] text-slate-800 focus:outline-none"
                    >
                      <option value="candidate">Candidate</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      u.isVerified
                        ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-950/20 text-amber-400 border border-amber-500/20'
                    }`}>
                      {u.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-1.5 bg-rose-950/20 border border-rose-500/20 text-rose-400 hover:bg-rose-900/40 rounded transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
