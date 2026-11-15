import React from 'react';
import {
  LayoutDashboard,
  Laptop,
  Wrench,
  Bell,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, notifications } = useApp();

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'assets',
      label: 'Thiết bị của tôi',
      icon: Laptop,
      badge: null,
    },
    {
      id: 'repairs',
      label: 'Lịch sử sửa chữa',
      icon: Wrench,
      badge: null,
    },
    {
      id: 'notifications',
      label: 'Cảnh báo bảo hành',
      icon: Bell,
      badge: unreadNotifCount > 0 ? unreadNotifCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'analytics',
      label: 'Báo cáo & Thống kê',
      icon: BarChart3,
      badge: null,
    },
    ...(currentUser.role === 'admin'
      ? [
          {
            id: 'admin',
            label: 'Quản trị hệ thống',
            icon: ShieldAlert,
            badge: 'Admin',
            badgeColor: 'bg-purple-100 text-purple-700',
          },
        ]
      : []),
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all select-none ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
