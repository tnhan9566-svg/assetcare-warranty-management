import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Wrench,
  CheckCheck,
  Calendar,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { timeAgo } from '../../utils/formatters';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setSelectedAssetId,
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all'); // all | unread | urgent | expired | maintenance

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'unread') return !n.isRead;
    if (filterType === 'urgent') return n.type === 'danger_7';
    if (filterType === 'warning') return n.type === 'warning_30' || n.type === 'warning_60';
    if (filterType === 'expired') return n.type === 'expired';
    if (filterType === 'maintenance') return n.type === 'maintenance';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Trung Tâm Cảnh Báo</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                {unreadCount} thông báo mới
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cơ chế thông báo tự động hạn bảo hành (60 ngày, 30 ngày, 7 ngày) và nhắc nhở bảo trì định kỳ
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Rules Explainer Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
        <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
          <Info className="w-4 h-4 text-amber-600" />
          Quy tắc kích hoạt cảnh báo thông minh
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-amber-800 pt-1">
          <div className="p-2 rounded-lg bg-white/70 border border-amber-200/60">
            <strong className="block text-amber-900">🟡 Cảnh báo 60 ngày</strong>
            Sắp kết thúc bảo hành sau 2 tháng
          </div>
          <div className="p-2 rounded-lg bg-white/70 border border-amber-200/60">
            <strong className="block text-amber-900">🟠 Cảnh báo 30 ngày</strong>
            Thời điểm vàng để kiểm tra tổng thể
          </div>
          <div className="p-2 rounded-lg bg-white/70 border border-amber-200/60">
            <strong className="block text-rose-700">🔴 Khẩn cấp 7 ngày</strong>
            Hạn cuối trước khi mất quyền bảo hành
          </div>
          <div className="p-2 rounded-lg bg-white/70 border border-amber-200/60">
            <strong className="block text-slate-700">⚠️ Đã hết bảo hành</strong>
            Gợi ý gia hạn hoặc lưu ý sửa chữa
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
            filterType === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('unread')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
            filterType === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Chưa đọc ({unreadCount})
        </button>
        <button
          onClick={() => setFilterType('urgent')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
            filterType === 'urgent'
              ? 'bg-rose-600 text-white'
              : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
          }`}
        >
          🔴 Khẩn cấp (7 ngày)
        </button>
        <button
          onClick={() => setFilterType('warning')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
            filterType === 'warning'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
          }`}
        >
          🟡 Cảnh báo 30-60 ngày
        </button>
        <button
          onClick={() => setFilterType('expired')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
            filterType === 'expired'
              ? 'bg-slate-700 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⚠️ Đã hết hạn
        </button>
        <button
          onClick={() => setFilterType('maintenance')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
            filterType === 'maintenance'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100'
          }`}
        >
          🔧 Bảo dưỡng định kỳ
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Không có thông báo nào</h3>
          <p className="text-xs text-slate-400 mt-1">
            Tất cả các cảnh báo về thời hạn bảo hành sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.assetId) setSelectedAssetId(n.assetId);
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                !n.isRead
                  ? 'bg-white border-blue-300 shadow-sm ring-1 ring-blue-100'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex-shrink-0">
                  {n.type === 'danger_7' ? (
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                      <AlertTriangle className="w-5 h-5 animate-bounce" />
                    </div>
                  ) : n.type === 'warning_30' || n.type === 'warning_60' ? (
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  ) : n.type === 'maintenance' ? (
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Wrench className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                      {n.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    {n.assetName && (
                      <span className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                        Xem chi tiết {n.assetName} →
                      </span>
                    )}

                    {!n.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationRead(n.id);
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-700 ml-auto"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
