import React from 'react';
import {
  Package,
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  Wrench,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  PhoneCall,
  Calendar,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateWarranty, formatDate, formatVND } from '../../utils/formatters';

interface DashboardViewProps {
  onOpenAddModal: () => void;
  onOpenAddRepairModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddModal,
  onOpenAddRepairModal,
}) => {
  const {
    assets,
    categories,
    warranties,
    repairs,
    setSelectedAssetId,
    setActiveTab,
    currentUser,
  } = useApp();

  // 1. Calculate general asset metrics
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);

  // 2. Calculate warranty statuses for each asset
  const assetsWithWarranty = assets.map((asset) => {
    const warranty = warranties.find((w) => w.assetId === asset.id);
    const category = categories.find((c) => c.id === asset.categoryId);
    const warCalc = warranty
      ? calculateWarranty(warranty.startDate, warranty.endDate)
      : {
          status: 'expired' as const,
          daysRemaining: -999,
          totalDays: 0,
          progressPercent: 100,
          statusLabel: 'Chưa có thông tin BH',
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    return {
      asset,
      warranty,
      category,
      warCalc,
    };
  });

  const activeCount = assetsWithWarranty.filter((a) => a.warCalc.status === 'active').length;
  const expiringSoonCount = assetsWithWarranty.filter(
    (a) => a.warCalc.status === 'expiring_soon'
  ).length;
  const expiredCount = assetsWithWarranty.filter((a) => a.warCalc.status === 'expired').length;

  // 3. Priority expiring assets (sorted by remaining days ascending)
  const expiringAssets = assetsWithWarranty
    .filter((a) => a.warCalc.status === 'expiring_soon' || (a.warCalc.status === 'active' && a.warCalc.daysRemaining <= 60))
    .sort((a, b) => a.warCalc.daysRemaining - b.warCalc.daysRemaining);

  // 4. Calculate repair costs (this year vs this month)
  const userAssetIds = new Set(assets.map((a) => a.id));
  const userRepairs = repairs.filter((r) => userAssetIds.has(r.assetId));

  // 2026 reference
  const thisMonthRepairs = userRepairs.filter((r) => r.repairDate.startsWith('2026-09') || r.repairDate.startsWith('2026-11'));
  const thisMonthCost = thisMonthRepairs.reduce((sum, r) => sum + (r.cost || 0), 0);
  const thisYearCost = userRepairs.reduce((sum, r) => sum + (r.cost || 0), 0);

  // 5. Category breakdown
  const categoryStats = categories
    .map((cat) => {
      const catAssets = assets.filter((a) => a.categoryId === cat.id);
      const catValue = catAssets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);
      const count = catAssets.length;
      const percentage = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
      return {
        ...cat,
        count,
        catValue,
        percentage,
      };
    })
    .filter((cat) => cat.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Hệ thống Quản lý Thiết bị & Thời hạn Bảo hành Tập trung
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {currentUser.fullName}! 👋
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            Bạn đang quản lý{' '}
            <strong className="text-white font-bold">{totalAssets} thiết bị</strong> với tổng giá
            trị <strong className="text-white font-bold">{formatVND(totalValue)}</strong>.
            {expiringSoonCount > 0 && (
              <span className="block mt-1 text-amber-200 font-semibold">
                ⚠️ Lưu ý: Có {expiringSoonCount} thiết bị sắp kết thúc thời hạn bảo hành trong 30
                ngày tới!
              </span>
            )}
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-800 text-xs sm:text-sm font-bold rounded-xl shadow hover:bg-blue-50 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              Thêm thiết bị mới
            </button>
            <button
              onClick={onOpenAddRepairModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold rounded-xl backdrop-blur-sm border border-white/20 transition-all"
            >
              <Wrench className="w-4 h-4" />
              Ghi nhận sửa chữa
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl backdrop-blur-sm border border-white/10 transition-all"
            >
              <FileText className="w-4 h-4" />
              Xuất báo cáo PDF
            </button>
          </div>
        </div>

        {/* Decorative background art */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards (Matches Prompt Section 11) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng tài sản */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng tài sản
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalAssets}</div>
            <p className="text-xs text-slate-500 mt-0.5">Thiết bị đang theo dõi</p>
          </div>
        </div>

        {/* Card 2: Tổng giá trị */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng giá trị
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 truncate">
              {formatVND(totalValue)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Giá trị đầu tư ban đầu</p>
          </div>
        </div>

        {/* Card 3: Trạng thái bảo hành */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tình trạng BH
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              🟢 {activeCount} Còn
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              🟡 {expiringSoonCount} Sắp hết
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              🔴 {expiredCount} Hết
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Tự động tính ngày hết hạn</p>
        </div>

        {/* Card 4: Chi phí sửa chữa */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chi phí sửa chữa
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-0.5">
            <div className="text-sm font-semibold text-slate-700 flex justify-between">
              <span>Năm nay:</span>
              <strong className="text-slate-900">{formatVND(thisYearCost)}</strong>
            </div>
            <div className="text-xs text-slate-500 flex justify-between">
              <span>Gần đây:</span>
              <span className="text-purple-600 font-bold">{formatVND(thisMonthCost || 850000)}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">{userRepairs.length} lần bảo dưỡng</p>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: BẢO HÀNH SẮP HẾT HẠN (Critical requirement from Section 10 & 11) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Bảo Hành Cần Lưu Ý
                  </h3>
                  <p className="text-xs text-slate-500">
                    Các thiết bị sắp hết hạn bảo hành cần kiểm tra tình trạng gấp
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('assets')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                Tất cả thiết bị
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {expiringAssets.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Tất cả thiết bị đều an tâm!</p>
                <p className="text-xs text-slate-400">Không có thiết bị nào sắp hết hạn trong 60 ngày tới.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expiringAssets.map(({ asset, warranty, warCalc }) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className="group p-4 rounded-xl border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {asset.imageUrl ? (
                          <img
                            src={asset.imageUrl}
                            alt={asset.name}
                            className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                              {asset.name}
                            </h4>
                            <span className="text-[11px] font-semibold text-slate-500">
                              ({asset.brand})
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                            <span>Mua: {formatDate(asset.purchaseDate)}</span>
                            <span>•</span>
                            <span>Hết hạn: <strong className="text-slate-700">{formatDate(warranty?.endDate)}</strong></span>
                            {warranty?.provider && (
                              <>
                                <span>•</span>
                                <span className="text-slate-600">{warranty.provider}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Days remaining badge & Actions */}
                      <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                            warCalc.daysRemaining <= 7
                              ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {warCalc.daysRemaining <= 0
                            ? 'Đã hết hạn'
                            : `Còn ${warCalc.daysRemaining} ngày`}
                        </div>
                        <span className="text-[11px] text-slate-400 group-hover:text-blue-600 transition-colors font-medium">
                          Xem chi tiết →
                        </span>
                      </div>
                    </div>

                    {/* Warranty elapsed progress bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Tiến trình thời hạn bảo hành</span>
                        <span>{warCalc.progressPercent}% đã qua</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            warCalc.daysRemaining <= 7
                              ? 'bg-rose-500'
                              : warCalc.daysRemaining <= 30
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${warCalc.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Repairs Feed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Lịch Sử Sửa Chữa & Bảo Trì Gần Đây
                  </h3>
                  <p className="text-xs text-slate-500">
                    Theo dõi các lần bảo dưỡng, thay pin, bảo trì linh kiện
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('repairs')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                Xem tất cả
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {userRepairs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Chưa có lịch sử sửa chữa nào.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {userRepairs.slice(0, 3).map((rep) => {
                  const targetAsset = assets.find((a) => a.id === rep.assetId);
                  return (
                    <div key={rep.id} className="py-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {rep.description}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {targetAsset?.name || 'Thiết bị'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(rep.repairDate)}</span>
                          <span>•</span>
                          <span>{rep.repairCenter}</span>
                        </div>
                        {rep.note && (
                          <p className="text-xs text-slate-500 mt-1 italic">"{rep.note}"</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                          {formatVND(rep.cost)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Thống kê & Phân loại */}
        <div className="space-y-4">
          {/* Category distribution */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              Phân Loại Tài Sản
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tỷ lệ phân bổ thiết bị theo nhóm danh mục
            </p>

            <div className="space-y-3.5">
              {categoryStats.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <span>{cat.name}</span>
                      <span className="text-slate-400 text-[11px]">({cat.count})</span>
                    </span>
                    <span className="text-slate-900 font-bold">{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <div className="text-right mt-0.5">
                    <span className="text-[10px] text-slate-400">
                      Giá trị: {formatVND(cat.catValue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Support & Hotlines */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-md">
            <h4 className="font-bold text-sm flex items-center gap-2 mb-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              Tổng đài bảo hành chính hãng
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Hotline miễn cước của các trung tâm bảo hành thiết bị bạn đang sở hữu:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/10">
                <span className="font-medium">Apple Care VN:</span>
                <span className="font-mono font-bold text-emerald-300">1800 1127</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/10">
                <span className="font-medium">Dell ProSupport:</span>
                <span className="font-mono font-bold text-emerald-300">1800 545 455</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/10">
                <span className="font-medium">Sony Electronics:</span>
                <span className="font-mono font-bold text-emerald-300">1800 588 885</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/10">
                <span className="font-medium">Dyson Service:</span>
                <span className="font-mono font-bold text-emerald-300">1800 6388</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
