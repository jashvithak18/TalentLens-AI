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
    <header className="h-16 bg-white border-b border-[#E5E7EB] fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6">
      {/* Brand logo (visible on mobile where sidebar is hidden) */}
      <div className="flex items-center space-x-3 md:hidden">
        <Logo showText={true} iconSize="h-7 w-7" textSize="text-md" />
      </div>

      {/* Global Search Bar (Placeholders/Search) */}
      <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-[#E5E7EB] rounded-lg px-3 py-1.5 w-80">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search everywhere..."
          className="bg-transparent border-none text-xs text-slate-800 focus:outline-none placeholder-slate-400 w-full"
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
              className="p-2 bg-slate-50 border border-[#E5E7EB] rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all relative"
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
              <div className="absolute right-0 mt-3 w-80 bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-4 z-50 overflow-hidden">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#E5E7EB]">
                  <h4 className="font-bold text-sm text-slate-900 font-jakarta">Notifications</h4>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{unreadCount} Unread</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifData?.notifications?.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
                  ) : (
                    notifData?.notifications?.map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-2.5 rounded-lg text-xs transition-all border ${
                          notif.isRead 
                            ? 'bg-slate-50 border-[#E5E7EB] text-slate-600' 
                            : 'bg-indigo-50/50 border-brandPrimary/20 text-slate-900 border-l-4 border-l-brandPrimary'
                        }`}
                      >
                        <p className="font-bold">{notif.title}</p>
                        <p className="text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                        <span className="text-[9px] text-slate-400 font-bold block mt-1">
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
          <div className="flex items-center space-x-3 pl-2 border-l border-[#E5E7EB]">
            <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-brandPrimary font-bold border border-[#E5E7EB]">
              <UserIcon size={16} />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-800">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-bold capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
