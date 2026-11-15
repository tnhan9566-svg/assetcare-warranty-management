import React, { useMemo } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Package,
  Wrench,
  Printer,
  ShieldCheck,
  Calendar,
  Download,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateWarranty, formatDate, formatVND } from '../../utils/formatters';

export const AnalyticsView: React.FC = () => {
  const { assets, categories, warranties, repairs, currentUser } = useApp();

  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);

  const userAssetIds = useMemo(() => new Set(assets.map((a) => a.id)), [assets]);
  const userRepairs = useMemo(
    () => repairs.filter((r) => userAssetIds.has(r.assetId)),
    [repairs, userAssetIds]
  );
  const totalRepairCost = userRepairs.reduce((sum, r) => sum + (r.cost || 0), 0);

  // 1. Category statistics
  const categoryStats = useMemo(() => {
    return categories
      .map((cat) => {
        const catAssets = assets.filter((a) => a.categoryId === cat.id);
        const count = catAssets.length;
        const value = catAssets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);
        const percentage = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
        return {
          ...cat,
          count,
          value,
          percentage,
        };
      })
      .filter((c) => c.count > 0)
      .sort((a, b) => b.value - a.value);
  }, [categories, assets, totalAssets]);

  // 2. Brand statistics
  const brandStats = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    assets.forEach((a) => {
      const b = a.brand || 'Khác';
      const cur = map.get(b) || { count: 0, value: 0 };
      map.set(b, {
        count: cur.count + 1,
        value: cur.value + (a.purchasePrice || 0),
      });
    });

    return Array.from(map.entries())
      .map(([brand, data]) => ({
        brand,
        count: data.count,
        value: data.value,
        percentage: totalValue > 0 ? Math.round((data.value / totalValue) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [assets, totalValue]);

  // 3. Monthly repair costs (Tháng 1 -> Tháng 12)
  const monthlyRepairs = useMemo(() => {
    const months = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ];

    const costs = Array(12).fill(0);

    userRepairs.forEach((r) => {
      try {
        const m = parseInt(r.repairDate.split('-')[1], 10) - 1;
        if (m >= 0 && m < 12) {
          costs[m] += r.cost || 0;
        }
      } catch {}
    });

    const maxCost = Math.max(...costs, 1000000);

    return months.map((month, idx) => ({
      month,
      cost: costs[idx],
      percent: Math.round((costs[idx] / maxCost) * 100),
    }));
  }, [userRepairs]);

  // 4. Warranty Status breakdown
  const warrantySummary = useMemo(() => {
    let active = 0;
    let expiring = 0;
    let expired = 0;

    assets.forEach((a) => {
      const w = warranties.find((war) => war.assetId === a.id);
      if (w) {
        const calc = calculateWarranty(w.startDate, w.endDate);
        if (calc.status === 'active') active++;
        else if (calc.status === 'expiring_soon') expiring++;
        else expired++;
      } else {
        expired++;
      }
    });

    return { active, expiring, expired };
  }, [assets, warranties]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Thống Kê & Báo Cáo</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              Thống kê chi tiết
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng hợp giá trị tài sản, phân tích chi phí sửa chữa và xuất báo cáo kiểm kê
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow transition-colors"
        >
          <Printer className="w-4 h-4" />
          In báo cáo kiểm kê (PDF)
        </button>
      </div>

      {/* Top 4 Stat Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Tổng giá trị thiết bị</div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-2 truncate">
            {formatVND(totalValue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{totalAssets} sản phẩm đã đăng ký</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Tổng chi phí sửa chữa</div>
          <div className="text-xl sm:text-2xl font-extrabold text-purple-600 mt-2 truncate">
            {formatVND(totalRepairCost)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Chiếm {totalValue > 0 ? ((totalRepairCost / totalValue) * 100).toFixed(1) : 0}% giá trị máy
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Tỷ lệ bảo hành còn hiệu lực</div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-2">
            {totalAssets > 0 ? Math.round((warrantySummary.active / totalAssets) * 100) : 0}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{warrantySummary.active} thiết bị an tâm</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Cần lưu ý kiểm tra</div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-2">
            {warrantySummary.expiring} thiết bị
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Sắp hết hạn trong vòng 30 ngày</p>
        </div>
      </div>

      {/* Monthly Repairs Column Bar Chart (FR12 Requirement) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Chi Phí Sửa Chữa Theo Tháng Trong Năm (FR12)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Biểu đồ phân bổ chi tiêu bảo dưỡng và sửa chữa từ Tháng 1 đến Tháng 12
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
            Năm 2026: {formatVND(totalRepairCost)}
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end h-48 pt-6 pb-2">
          {monthlyRepairs.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center h-full justify-end group">
              <div className="text-[9px] font-bold text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.cost > 0 ? formatVND(item.cost) : '0'}
              </div>
              <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end overflow-hidden">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    item.cost > 0
                      ? 'bg-gradient-to-t from-purple-600 to-indigo-500 group-hover:from-purple-500 group-hover:to-indigo-400'
                      : 'bg-transparent'
                  }`}
                  style={{ height: `${Math.max(item.cost > 0 ? 15 : 0, item.percent)}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-500 mt-2 truncate max-w-full">
                T{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Columns: Category Distribution & Brand Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Giá Trị Tài Sản Theo Nhóm Danh Mục
          </h3>

          <div className="space-y-4">
            {categoryStats.map((c) => (
              <div key={c.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-800 font-bold">{c.name} ({c.count} máy)</span>
                  <span className="text-blue-600 font-black">{formatVND(c.value)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full"
                    style={{
                      width: `${totalValue > 0 ? Math.round((c.value / totalValue) * 100) : 0}%`,
                    }}
                  />
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  {totalValue > 0 ? ((c.value / totalValue) * 100).toFixed(1) : 0}% tổng tài sản
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            Cơ Cấu Thương Hiệu Sở Hữu
          </h3>

          <div className="space-y-3.5">
            {brandStats.map((b) => (
              <div
                key={b.brand}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900">{b.brand}</h4>
                  <p className="text-[11px] text-slate-400">{b.count} thiết bị</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 block">{formatVND(b.value)}</span>
                  <span className="text-[10px] font-semibold text-emerald-600">
                    {b.percentage}% danh mục
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Printable Report Preview Table (Format for Academic Defense) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm print:shadow-none print:border-none">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Bảng Tổng Hợp Kiểm Kê Thiết Bị & Bảo Hành (Báo cáo in ấn)
            </h3>
            <p className="text-xs text-slate-500">
              Chủ sở hữu: <strong>{currentUser.fullName}</strong> ({currentUser.email})
            </p>
          </div>
          <span className="text-xs text-slate-400">Ngày xuất: 09/11/2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 font-bold text-slate-600 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Tên thiết bị</th>
                <th className="py-2.5 px-3">Serial / IMEI</th>
                <th className="py-2.5 px-3">Ngày mua</th>
                <th className="py-2.5 px-3">Giá mua</th>
                <th className="py-2.5 px-3">Hạn bảo hành</th>
                <th className="py-2.5 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((a, i) => {
                const w = warranties.find((war) => war.assetId === a.id);
                const calc = w ? calculateWarranty(w.startDate, w.endDate) : { statusLabel: 'Chưa có BH' };
                return (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-400">{i + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{a.name}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                      {a.serialNumber || a.imei || '-'}
                    </td>
                    <td className="py-2 px-3">{formatDate(a.purchaseDate)}</td>
                    <td className="py-2 px-3 font-bold">{formatVND(a.purchasePrice)}</td>
                    <td className="py-2 px-3">{formatDate(w?.endDate)}</td>
                    <td className="py-2 px-3 font-semibold">{calc.statusLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
