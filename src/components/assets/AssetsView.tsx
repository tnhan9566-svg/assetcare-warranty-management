import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  RotateCcw,
  Tag,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssetCard } from './AssetCard';
import { Asset } from '../../types';
import { calculateWarranty, formatDate, formatVND } from '../../utils/formatters';

interface AssetsViewProps {
  onOpenAddModal: () => void;
  onEditAsset: (asset: Asset) => void;
  onAddRepair: (assetId: string) => void;
  onShowQR: (asset: Asset) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  onOpenAddModal,
  onEditAsset,
  onAddRepair,
  onShowQR,
}) => {
  const {
    assets,
    categories,
    warranties,
    documents,
    repairs,
    deleteAsset,
    setSelectedAssetId,
    searchQuery,
    setSearchQuery,
    resetToSampleData,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // all | active | expiring_soon | expired
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('warranty_asc'); // warranty_asc | date_desc | price_desc | name_asc
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Extract unique brands for filter
  const uniqueBrands = useMemo(() => {
    const brands = Array.from(new Set(assets.map((a) => a.brand).filter(Boolean)));
    return brands.sort();
  }, [assets]);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        // Search keyword
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = asset.name?.toLowerCase().includes(q);
          const matchBrand = asset.brand?.toLowerCase().includes(q);
          const matchModel = asset.model?.toLowerCase().includes(q);
          const matchSerial = asset.serialNumber?.toLowerCase().includes(q);
          const matchImei = asset.imei?.toLowerCase().includes(q);
          const matchPlace = asset.purchasePlace?.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchModel && !matchSerial && !matchImei && !matchPlace) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && asset.categoryId !== selectedCategory) {
          return false;
        }

        // Brand filter
        if (selectedBrand !== 'all' && asset.brand !== selectedBrand) {
          return false;
        }

        // Warranty status filter
        if (selectedStatus !== 'all') {
          const warranty = warranties.find((w) => w.assetId === asset.id);
          const warCalc = warranty
            ? calculateWarranty(warranty.startDate, warranty.endDate)
            : { status: 'expired' };

          if (warCalc.status !== selectedStatus) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const warA = warranties.find((w) => w.assetId === a.id);
        const warB = warranties.find((w) => w.assetId === b.id);

        if (sortBy === 'warranty_asc') {
          const dateA = warA?.endDate ? new Date(warA.endDate).getTime() : 0;
          const dateB = warB?.endDate ? new Date(warB.endDate).getTime() : 0;
          return dateA - dateB;
        }
        if (sortBy === 'date_desc') {
          return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
        }
        if (sortBy === 'price_desc') {
          return (b.purchasePrice || 0) - (a.purchasePrice || 0);
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [assets, warranties, searchQuery, selectedCategory, selectedBrand, selectedStatus, sortBy]);

  // Statistics counters for filter pills
  const counts = useMemo(() => {
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
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Danh Sách Thiết Bị</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {filteredAssets.length} / {assets.length} thiết bị
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý tập trung thông tin mua sắm, số serial, hóa đơn và trạng thái bảo hành
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Thêm thiết bị mới
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên thiết bị, thương hiệu, số serial, IMEI, nơi mua..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
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

          {/* Brand select */}
          <div className="flex items-center gap-2">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả thương hiệu</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="warranty_asc">Hạn BH gần nhất</option>
              <option value="date_desc">Ngày mua mới nhất</option>
              <option value="price_desc">Giá trị cao nhất</option>
              <option value="name_asc">Tên A-Z</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                }`}
                title="Dạng lưới"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                }`}
                title="Dạng bảng"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills: Category & Warranty Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Warranty Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Trạng thái:
            </span>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({assets.length})
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                selectedStatus === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              🟢 Còn bảo hành ({counts.active})
            </button>
            <button
              onClick={() => setSelectedStatus('expiring_soon')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                selectedStatus === 'expiring_soon'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              🟡 Sắp hết hạn ({counts.expiring})
            </button>
            <button
              onClick={() => setSelectedStatus('expired')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                selectedStatus === 'expired'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              🔴 Đã hết hạn ({counts.expired})
            </button>
          </div>

          {/* Reset Filters button */}
          {(selectedCategory !== 'all' || selectedStatus !== 'all' || selectedBrand !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedBrand('all');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Đặt lại bộ lọc
            </button>
          )}
        </div>

        {/* Category Horizontal Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả danh mục
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Content Display */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy thiết bị phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Không có tài sản nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại của bạn.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedBrand('all');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Thêm thiết bị mới
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAssets.map((asset) => {
            const category = categories.find((c) => c.id === asset.categoryId);
            const warranty = warranties.find((w) => w.assetId === asset.id);
            const docCount = documents.filter((d) => d.assetId === asset.id).length;
            const repCount = repairs.filter((r) => r.assetId === asset.id).length;

            return (
              <AssetCard
                key={asset.id}
                asset={asset}
                category={category}
                warranty={warranty}
                documentCount={docCount}
                repairCount={repCount}
                onViewDetail={(id) => setSelectedAssetId(id)}
                onEdit={onEditAsset}
                onDelete={deleteAsset}
                onAddRepair={onAddRepair}
                onShowQR={onShowQR}
              />
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Tên thiết bị</th>
                  <th className="py-3.5 px-3">Danh mục</th>
                  <th className="py-3.5 px-3">Serial / IMEI</th>
                  <th className="py-3.5 px-3">Ngày mua</th>
                  <th className="py-3.5 px-3">Giá mua</th>
                  <th className="py-3.5 px-3">Thời hạn bảo hành</th>
                  <th className="py-3.5 px-3">Trạng thái BH</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAssets.map((asset) => {
                  const category = categories.find((c) => c.id === asset.categoryId);
                  const warranty = warranties.find((w) => w.assetId === asset.id);
                  const warCalc = warranty
                    ? calculateWarranty(warranty.startDate, warranty.endDate)
                    : { status: 'expired' as const, daysRemaining: 0, statusLabel: 'Chưa có BH', badgeColor: 'bg-slate-100' };

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {asset.imageUrl ? (
                            <img
                              src={asset.imageUrl}
                              alt={asset.name}
                              className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                              💻
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{asset.name}</p>
                            <p className="text-[11px] text-slate-400">{asset.brand} - {asset.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {category?.name || 'Chung'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                        {asset.serialNumber || asset.imei || '-'}
                      </td>
                      <td className="py-3 px-3">{formatDate(asset.purchaseDate)}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {formatVND(asset.purchasePrice)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">
                          {formatDate(warranty?.endDate)}
                        </span>
                        {warranty?.provider && (
                          <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">
                            {warranty.provider}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${warCalc.badgeColor}`}>
                          {warCalc.status === 'active' && '🟢 Còn BH'}
                          {warCalc.status === 'expiring_soon' && `🟡 Còn ${warCalc.daysRemaining}d`}
                          {warCalc.status === 'expired' && '🔴 Hết BH'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAssetId(asset.id);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        >
                          Chi tiết
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
    </div>
  );
};
