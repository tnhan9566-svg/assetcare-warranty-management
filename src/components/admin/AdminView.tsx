import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  FolderTree,
  Activity,
  Database,
  Plus,
  Trash2,
  Edit,
  Check,
  RotateCcw,
  Download,
  Upload,
  UserCheck,
  UserX,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatDateTime, formatVND } from '../../utils/formatters';
import { Category } from '../../types';

export const AdminView: React.FC = () => {
  const {
    users,
    categories,
    allAssets,
    activityLogs,
    addCategory,
    updateCategory,
    deleteCategory,
    updateUserStatus,
    updateUserRole,
    resetToSampleData,
  } = useApp();

  const [adminTab, setAdminTab] = useState<'users' | 'categories' | 'logs' | 'backup'>('users');

  // Category modal / inline form
  const [showAddCat, setShowAddCat] = useState(false);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('Laptop');
  const [catDesc, setCatDesc] = useState('');
  const [catWarrantyMonths, setCatWarrantyMonths] = useState<number>(12);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    addCategory({
      name: catName,
      icon: catIcon,
      description: catDesc || 'Danh mục thiết bị điện tử',
      defaultWarrantyMonths: Number(catWarrantyMonths),
    });

    setCatName('');
    setCatDesc('');
    setShowAddCat(false);
  };

  // Export full JSON backup
  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      users: JSON.parse(localStorage.getItem('assetcare_users') || '[]'),
      categories: JSON.parse(localStorage.getItem('assetcare_categories') || '[]'),
      assets: JSON.parse(localStorage.getItem('assetcare_assets') || '[]'),
      warranties: JSON.parse(localStorage.getItem('assetcare_warranties') || '[]'),
      documents: JSON.parse(localStorage.getItem('assetcare_documents') || '[]'),
      repairs: JSON.parse(localStorage.getItem('assetcare_repairs') || '[]'),
      logs: JSON.parse(localStorage.getItem('assetcare_activity_logs') || '[]'),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AssetCare_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Quản Trị Hệ Thống</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              Admin Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý tài khoản, danh mục thiết bị, kiểm tra nhật ký hoạt động và sao lưu dữ liệu
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          Xuất file sao lưu JSON
        </button>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm space-x-1 sm:space-x-2">
        <button
          onClick={() => setAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            adminTab === 'users'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Quản lý người dùng ({users.length})
        </button>

        <button
          onClick={() => setAdminTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            adminTab === 'categories'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Danh mục thiết bị ({categories.length})
        </button>

        <button
          onClick={() => setAdminTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            adminTab === 'logs'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          Nhật ký hoạt động ({activityLogs.length})
        </button>

        <button
          onClick={() => setAdminTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            adminTab === 'backup'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          Cơ sở dữ liệu & Sao lưu
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Danh Sách Tài Khoản Trong Hệ Thống
            </h3>
            <span className="text-xs text-slate-500">
              Tổng số tài sản toàn hệ thống: <strong>{allAssets.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 font-bold text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Người dùng</th>
                  <th className="py-3 px-3">Email & SĐT</th>
                  <th className="py-3 px-3">Vai trò</th>
                  <th className="py-3 px-3">Tài sản sở hữu</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => {
                  const userAssetCount = allAssets.filter((a) => a.userId === u.id).length;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.fullName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{u.fullName}</p>
                            <p className="text-[10px] text-slate-400">Tham gia: {formatDate(u.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-slate-800 font-medium">{u.email}</p>
                        <p className="text-[10px] text-slate-400">{u.phone || 'Chưa có SĐT'}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {userAssetCount} thiết bị
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() =>
                            updateUserRole(u.id, u.role === 'admin' ? 'user' : 'admin')
                          }
                          className="px-2 py-1 text-[11px] font-bold text-purple-600 hover:bg-purple-50 rounded"
                          title="Đổi vai trò"
                        >
                          {u.role === 'admin' ? 'Hạ xuống User' : 'Nâng lên Admin'}
                        </button>
                        <button
                          onClick={() =>
                            updateUserStatus(u.id, u.status === 'active' ? 'inactive' : 'active')
                          }
                          className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded"
                        >
                          {u.status === 'active' ? 'Khóa' : 'Kích hoạt'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY MANAGEMENT */}
      {adminTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-base">
              Danh Mục Tài Sản & Cấu Hình Bảo Hành Chuẩn
            </h3>
            <button
              onClick={() => setShowAddCat(!showAddCat)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Thêm danh mục mới
            </button>
          </div>

          {showAddCat && (
            <form
              onSubmit={handleCreateCategory}
              className="p-5 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-3 text-xs"
            >
              <h4 className="font-bold text-slate-800 text-sm">Thêm danh mục thiết bị mới</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên danh mục</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Màn hình máy tính..."
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mô tả tóm tắt</label>
                  <input
                    type="text"
                    placeholder="Màn hình gaming, đồ họa..."
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Bảo hành chuẩn (Tháng)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={catWarrantyMonths}
                    onChange={(e) => setCatWarrantyMonths(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddCat(false)}
                  className="px-3 py-1.5 text-slate-600 border border-slate-300 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700"
                >
                  Lưu danh mục
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => {
              const count = allAssets.filter((a) => a.categoryId === c.id).length;
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900">{c.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        BH chuẩn: {c.defaultWarrantyMonths}T
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{count} thiết bị đang quản lý</span>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa danh mục ${c.name}?`)) {
                          deleteCategory(c.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITY LOGS */}
      {adminTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Nhật Ký Thao Tác Hệ Thống (Audit Logs)
            </h3>
            <span className="text-xs text-slate-500">Tự động ghi lại các biến động dữ liệu</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{log.action}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        Bởi: {log.userName}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{log.description}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0 font-mono">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE & BACKUP */}
      {adminTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-purple-700">
              <Database className="w-5 h-5" />
              <h4 className="font-extrabold text-sm text-slate-900">
                Sao Lưu & Di Chuyển Dữ Liệu
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tải toàn bộ cơ sở dữ liệu gồm 10 bảng (Users, Categories, Assets, Warranties,
              Documents, Repairs, Notifications, ActivityLogs) dưới dạng JSON chuẩn.
            </p>
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
            >
              <Download className="w-4 h-4" />
              Tải xuống bản sao lưu (.json)
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-700">
              <RotateCcw className="w-5 h-5" />
              <h4 className="font-extrabold text-sm text-rose-900">
                Khôi Phục Dữ Liệu Mẫu Đồ Án
              </h4>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              Nếu bạn muốn đưa ứng dụng về trạng thái ban đầu với dữ liệu mẫu hoàn chỉnh (iPhone, Dell XPS, Sony WH-1000XM5, Dreame L20...), hãy bấm nút dưới đây.
            </p>
            <button
              onClick={() => {
                if (confirm('Khôi phục dữ liệu mẫu sẽ đưa các tài sản và bảo hành về mặc định. Tiếp tục?')) {
                  resetToSampleData();
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
            >
              <RotateCcw className="w-4 h-4" />
              Khôi phục dữ liệu mẫu ban đầu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
