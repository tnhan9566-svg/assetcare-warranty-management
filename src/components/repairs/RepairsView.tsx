import React, { useState, useMemo } from 'react';
import {
  Wrench,
  PlusCircle,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Building,
  UserCheck,
  ShieldCheck,
  Trash2,
  Package,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatVND } from '../../utils/formatters';

interface RepairsViewProps {
  onOpenAddRepairModal: (assetId?: string) => void;
}

export const RepairsView: React.FC<RepairsViewProps> = ({ onOpenAddRepairModal }) => {
  const { assets, repairs, deleteRepair, setSelectedAssetId } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetFilter, setSelectedAssetFilter] = useState<string>('all');

  // Filter repairs
  const userAssetIds = useMemo(() => new Set(assets.map((a) => a.id)), [assets]);
  const userRepairs = useMemo(
    () => repairs.filter((r) => userAssetIds.has(r.assetId)),
    [repairs, userAssetIds]
  );

  const filteredRepairs = useMemo(() => {
    return userRepairs.filter((rep) => {
      const asset = assets.find((a) => a.id === rep.assetId);

      if (selectedAssetFilter !== 'all' && rep.assetId !== selectedAssetFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDesc = rep.description.toLowerCase().includes(q);
        const matchCenter = rep.repairCenter?.toLowerCase().includes(q);
        const matchNote = rep.note?.toLowerCase().includes(q);
        const matchAssetName = asset?.name.toLowerCase().includes(q);
        if (!matchDesc && !matchCenter && !matchNote && !matchAssetName) {
          return false;
        }
      }

      return true;
    });
  }, [userRepairs, assets, selectedAssetFilter, searchQuery]);

  // Aggregate stats
  const totalCost = userRepairs.reduce((sum, r) => sum + (r.cost || 0), 0);
  const totalRepairsCount = userRepairs.length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Lịch Sử Sửa Chữa & Bảo Trì</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              {filteredRepairs.length} bản ghi
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi chi phí sửa chữa, linh kiện thay thế và đánh giá độ bền của từng thiết bị
          </p>
        </div>

        <button
          onClick={() => onOpenAddRepairModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Ghi nhận sửa chữa mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng chi phí sửa chữa
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2">{formatVND(totalCost)}</div>
          <p className="text-xs text-slate-400 mt-0.5">Tích lũy từ tất cả các lần sửa</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng số lần bảo dưỡng
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalRepairsCount} lượt</div>
          <p className="text-xs text-slate-400 mt-0.5">Vệ sinh, thay pin, bảo dưỡng phần cứng</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chi phí trung bình
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {formatVND(totalRepairsCount > 0 ? Math.round(totalCost / totalRepairsCount) : 0)}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Trung bình trên một lần sửa chữa</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo nội dung sửa, trung tâm bảo hành, tên thiết bị..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedAssetFilter}
            onChange={(e) => setSelectedAssetFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả thiết bị</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Repairs List */}
      {filteredRepairs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Chưa có bản ghi sửa chữa phù hợp</h3>
          <p className="text-xs text-slate-400 mt-1">
            Ghi nhận lịch sử sửa chữa để kiểm soát chi phí bảo dưỡng tài sản tốt hơn.
          </p>
          <button
            onClick={() => onOpenAddRepairModal()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700"
          >
            Ghi nhận sửa chữa đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRepairs.map((rep) => {
            const asset = assets.find((a) => a.id === rep.assetId);
            return (
              <div
                key={rep.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-purple-200 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {asset?.imageUrl ? (
                      <img
                        src={asset.imageUrl}
                        alt={asset.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 flex-shrink-0 cursor-pointer"
                        onClick={() => setSelectedAssetId(asset.id)}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-6 h-6" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                          {rep.description}
                        </h3>
                        {asset && (
                          <button
                            onClick={() => setSelectedAssetId(asset.id)}
                            className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors"
                          >
                            💻 {asset.name}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Ngày sửa: <strong>{formatDate(rep.repairDate)}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {rep.repairCenter}
                        </span>
                        {rep.technician && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              KT: {rep.technician}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <span className="text-base sm:text-lg font-black text-purple-700">
                      {formatVND(rep.cost)}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('Bạn có chắc muốn xóa bản ghi sửa chữa này?')) {
                          deleteRepair(rep.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {rep.note && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong className="text-slate-700">Ghi chú:</strong> {rep.note}
                  </p>
                )}

                {rep.warrantyUntil && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Linh kiện được bảo hành đến ngày: {formatDate(rep.warrantyUntil)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
