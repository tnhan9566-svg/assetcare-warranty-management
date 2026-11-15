import React from 'react';
import {
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  Camera,
  Home,
  Cpu,
  Package,
  Calendar,
  DollarSign,
  Tag,
  Wrench,
  QrCode,
  FileText,
  Clock,
  MoreVertical,
  Trash2,
  Edit,
} from 'lucide-react';
import { Asset, Category, Warranty } from '../../types';
import { calculateWarranty, formatDate, formatVND } from '../../utils/formatters';

interface AssetCardProps {
  asset: Asset;
  category?: Category;
  warranty?: Warranty;
  documentCount: number;
  repairCount: number;
  onViewDetail: (id: string) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onAddRepair: (assetId: string) => void;
  onShowQR: (asset: Asset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  category,
  warranty,
  documentCount,
  repairCount,
  onViewDetail,
  onEdit,
  onDelete,
  onAddRepair,
  onShowQR,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const warCalc = warranty
    ? calculateWarranty(warranty.startDate, warranty.endDate)
    : {
        status: 'expired' as const,
        daysRemaining: -999,
        totalDays: 0,
        progressPercent: 100,
        statusLabel: 'Chưa có thông tin BH',
        badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
      };

  const getCategoryIcon = (catName?: string) => {
    if (!catName) return Package;
    if (catName.includes('Laptop') || catName.includes('Máy tính')) return Laptop;
    if (catName.includes('Điện thoại') || catName.includes('Tablet')) return Smartphone;
    if (catName.includes('Tai nghe') || catName.includes('Âm thanh')) return Headphones;
    if (catName.includes('Đồng hồ')) return Watch;
    if (catName.includes('Máy ảnh')) return Camera;
    if (catName.includes('Gia dụng')) return Home;
    return Cpu;
  };

  const CatIcon = getCategoryIcon(category?.name);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Image Thumbnail */}
      <div className="relative">
        <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
          {asset.imageUrl ? (
            <img
              src={asset.imageUrl}
              alt={asset.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
              <Package className="w-16 h-16" />
            </div>
          )}

          {/* Category Chip */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold">
            <CatIcon className="w-3.5 h-3.5" />
            <span>{category?.name || 'Thiết bị'}</span>
          </div>

          {/* Actions button */}
          <div className="absolute top-3 right-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 shadow-sm transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(asset);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-400" />
                  Sửa thông tin
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onAddRepair(asset.id);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  Ghi nhận sửa chữa
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onShowQR(asset);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-400" />
                  Xem tem & QR code
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (confirm(`Bạn có chắc chắn muốn xóa thiết bị "${asset.name}"?`)) {
                      onDelete(asset.id);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa thiết bị
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge floating */}
        <div className="px-5 -mt-3.5 relative z-10">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${warCalc.badgeColor}`}
          >
            {warCalc.status === 'active' && '🟢 Còn bảo hành'}
            {warCalc.status === 'expiring_soon' && (
              <span className="flex items-center gap-1 text-amber-800">
                <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                Sắp hết hạn: còn {warCalc.daysRemaining} ngày
              </span>
            )}
            {warCalc.status === 'expired' && '🔴 Hết bảo hành'}
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 pt-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3
              onClick={() => onViewDetail(asset.id)}
              className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
            >
              {asset.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
            <span className="text-slate-800 font-semibold">{asset.brand}</span>
            <span>•</span>
            <span>Model: {asset.model || 'Chưa rõ'}</span>
          </div>

          {/* Serial Number & IMEI badges */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {asset.serialNumber && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                <Tag className="w-3 h-3 text-slate-400" />
                SN: {asset.serialNumber}
              </span>
            )}
            {asset.imei && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                IMEI: {asset.imei}
              </span>
            )}
          </div>

          {/* Key Purchase & Warranty Information */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Ngày mua:
              </span>
              <strong className="text-slate-800">{formatDate(asset.purchaseDate)}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                Giá mua:
              </span>
              <span className="font-bold text-slate-900">{formatVND(asset.purchasePrice)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Hết hạn BH:</span>
              <span
                className={`font-semibold ${
                  warCalc.status === 'expired'
                    ? 'text-rose-600'
                    : warCalc.status === 'expiring_soon'
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {formatDate(warranty?.endDate)}
              </span>
            </div>
          </div>

          {/* Warranty Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  warCalc.status === 'expired'
                    ? 'bg-rose-500'
                    : warCalc.status === 'expiring_soon'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${warCalc.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer info & Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {documentCount > 0 && (
              <span className="flex items-center gap-1 hover:text-slate-600" title="Hóa đơn & Tài liệu">
                <FileText className="w-3.5 h-3.5" />
                {documentCount}
              </span>
            )}
            {repairCount > 0 && (
              <span className="flex items-center gap-1 hover:text-slate-600 text-purple-600 font-semibold" title="Số lần sửa chữa">
                <Wrench className="w-3.5 h-3.5" />
                {repairCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onShowQR(asset)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              title="Tem nhãn QR"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewDetail(asset.id)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
            >
              Chi tiết →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
