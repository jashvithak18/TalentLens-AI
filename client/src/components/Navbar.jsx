import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Bell, Search, Menu, User as UserIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    enabled: !!user
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const unreadCount = notifData?.notifications?.filter(n => !n.isRead).length || 0;

  return (
    <header className="h-16 glass-panel border-b border-darkBorder fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6">
      {/* Brand logo (visible on mobile where sidebar is hidden) */}
      <div className="flex items-center space-x-3 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
          TL
        </div>
        <span className="font-semibold text-white tracking-wide text-sm">TalentLens AI</span>
      </div>

      {/* Global Search Bar (Placeholders/Search) */}
      <div className="hidden md:flex items-center space-x-2 bg-slate-900/60 border border-darkBorder rounded-lg px-3 py-1.5 w-80">
        <Search size={16} className="text-slate-500" />
        <input
          type="text"
          placeholder="Search everywhere..."
          className="bg-transparent border-none text-xs text-gray-200 focus:outline-none placeholder-slate-500 w-full"
        />
      </div>

      {/* User Actions */}
      {user && (
        <div className="flex items-center space-x-4 ml-auto">
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (unreadCount > 0) {
                  markAllReadMutation.mutate();
                }
              }}
              className="p-2 bg-slate-900 border border-darkBorder rounded-lg text-slate-400 hover:text-white transition-all relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-darkCard border border-darkBorder rounded-xl shadow-2xl p-4 z-50 overflow-hidden">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-darkBorder">
                  <h4 className="font-semibold text-sm text-gray-100">Notifications</h4>
                  <span className="text-xs text-slate-500">{unreadCount} Unread</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifData?.notifications?.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                  ) : (
                    notifData?.notifications?.map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-2.5 rounded-lg text-xs transition-all ${
                          notif.isRead ? 'bg-slate-900/30' : 'bg-indigo-950/20 border-l-2 border-brandPrimary'
                        }`}
                      >
                        <p className="font-medium text-gray-200">{notif.title}</p>
                        <p className="text-textMuted mt-0.5">{notif.message}</p>
                        <span className="text-[10px] text-slate-600 block mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Summary */}
          <div className="flex items-center space-x-3 pl-2 border-l border-darkBorder">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-slate-700">
              <UserIcon size={16} />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-gray-200">{user.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
