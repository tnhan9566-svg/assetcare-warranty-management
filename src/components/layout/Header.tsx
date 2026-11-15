import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Bell,
  PlusCircle,
  User as UserIcon,
  LogOut,
  Settings,
  CheckCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { timeAgo } from '../../utils/formatters';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenAuthModal,
  onOpenProfileModal,
}) => {
  const {
    currentUser,
    users,
    switchUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    setSelectedAssetId,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifClick = (assetId?: string, notifId?: string) => {
    if (notifId) markNotificationRead(notifId);
    if (assetId) {
      setSelectedAssetId(assetId);
    }
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Asset<span className="text-blue-600">Care</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-100 text-blue-700">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium hidden sm:block">
                Quản lý thiết bị & Bảo hành cá nhân
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm thiết bị, serial, IMEI, thương hiệu..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length > 0) {
                    setActiveTab('assets');
                  }
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Add Asset Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow shadow-blue-500/25 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Thêm thiết bị</span>
              <span className="sm:hidden">Thêm</span>
            </button>

            {/* Notification Center */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                title="Thông báo hạn bảo hành"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-sm">Cảnh báo bảo hành</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">
                          {unreadCount} mới
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Không có thông báo nào.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotifClick(n.assetId, n.id)}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.isRead ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex-shrink-0">
                              {n.type === 'danger_7' ? (
                                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                                  <AlertTriangle className="w-4 h-4" />
                                </div>
                              ) : n.type === 'warning_30' ? (
                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                  <Clock className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                  <ShieldAlert className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 leading-tight">
                                {n.title}
                              </p>
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                                {n.message}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {timeAgo(n.createdAt)}
                              </p>
                            </div>
                            {!n.isRead && (
                              <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab('notifications');
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Xem tất cả cảnh báo →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Demo Switcher */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/60"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <div className="text-left hidden lg:block pr-1">
                  <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                    {currentUser.fullName}
                    {currentUser.role === 'admin' && (
                      <span className="text-[9px] bg-purple-100 text-purple-700 font-extrabold px-1 rounded">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-none">
                    {currentUser.role === 'admin' ? 'Quản trị viên' : 'Chủ sở hữu'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      Vai trò: {currentUser.role === 'admin' ? 'Quản trị hệ thống' : 'Người dùng cá nhân'}
                    </span>
                  </div>

                  {/* Switch Demo Accounts */}
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Chuyển tài khoản Demo
                    </p>
                    <div className="space-y-1">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                            u.id === currentUser.id
                              ? 'bg-blue-50 text-blue-700 font-bold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <img
                            src={u.avatar}
                            alt={u.fullName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="truncate">{u.fullName}</span>
                          <span className="text-[9px] uppercase text-slate-400 ml-auto">
                            {u.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfileModal();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      Thông tin cá nhân
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveTab('admin');
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-semibold"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Bảng Quản trị viên (Admin)
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuthModal();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Đăng nhập / Đăng ký mới
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
