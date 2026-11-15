import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Calendar,
  DollarSign,
  Tag,
  Building,
  PhoneCall,
  Globe,
  FileText,
  Wrench,
  QrCode,
  Download,
  Trash2,
  Plus,
  ExternalLink,
  Clock,
  Printer,
  Edit,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateWarranty, formatDate, formatVND } from '../../utils/formatters';
import { Asset, DocumentType } from '../../types';

interface AssetDetailModalProps {
  assetId: string;
  onClose: () => void;
  onEdit: (asset: Asset) => void;
  onAddRepair: (assetId: string) => void;
  onShowQR: (asset: Asset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  assetId,
  onClose,
  onEdit,
  onAddRepair,
  onShowQR,
}) => {
  const {
    assets,
    categories,
    getAssetWarranty,
    getAssetDocuments,
    getAssetRepairs,
    addDocument,
    deleteDocument,
    deleteAsset,
    deleteRepair,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'info' | 'documents' | 'repairs' | 'qr'>('info');

  // File upload state for documents
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<DocumentType>('invoice');
  const [docNote, setDocNote] = useState('');
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<string | null>(null);

  const asset = assets.find((a) => a.id === assetId);
  if (!asset) return null;

  const category = categories.find((c) => c.id === asset.categoryId);
  const warranty = getAssetWarranty(asset.id);
  const documents = getAssetDocuments(asset.id);
  const repairs = getAssetRepairs(asset.id);

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

  const totalRepairCost = repairs.reduce((sum, r) => sum + (r.cost || 0), 0);

  // Handle local file selection to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileUrl = event.target?.result as string;
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      addDocument({
        assetId: asset.id,
        name: docName || file.name,
        fileUrl: fileUrl,
        fileType: docType,
        fileSize: sizeStr,
        note: docNote || 'Tải lên trực tiếp từ thiết bị',
      });
      setDocName('');
      setDocNote('');
    };
    reader.readAsDataURL(file);
  };

  // Add sample receipt quickly
  const handleAddSampleDoc = (type: DocumentType) => {
    const sampleImages: Record<DocumentType, { name: string; url: string; size: string }> = {
      invoice: {
        name: `Hoa_don_VAT_${asset.brand}.pdf`,
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        size: '1.2 MB',
      },
      warranty_card: {
        name: `Phieu_bao_hanh_chinh_hang_${asset.brand}.jpg`,
        url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        size: '780 KB',
      },
      photo: {
        name: `Anh_chup_tem_serial_${asset.name}.jpg`,
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
        size: '950 KB',
      },
      manual: {
        name: `Huong_dan_su_dung_${asset.model}.pdf`,
        url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        size: '2.5 MB',
      },
      other: {
        name: `Bien_ban_ban_giao.pdf`,
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        size: '500 KB',
      },
    };

    const sample = sampleImages[type];
    addDocument({
      assetId: asset.id,
      name: sample.name,
      fileUrl: sample.url,
      fileType: type,
      fileSize: sample.size,
      note: 'Tài liệu mẫu lưu trữ điện tử',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-center gap-4">
            {asset.imageUrl ? (
              <img
                src={asset.imageUrl}
                alt={asset.name}
                className="w-16 h-16 rounded-2xl object-cover ring-1 ring-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                💻
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-200/80 text-slate-800">
                  {category?.name || 'Thiết bị'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${warCalc.badgeColor}`}>
                  {warCalc.statusLabel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {asset.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {asset.brand} • Model: {asset.model} • Thêm vào: {formatDate(asset.createdAt)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex space-x-6">
          <button
            onClick={() => setActiveSubTab('info')}
            className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeSubTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Thông tin & Bảo hành
          </button>
          <button
            onClick={() => setActiveSubTab('documents')}
            className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeSubTab === 'documents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Hóa đơn & Tài liệu ({documents.length})
          </button>
          <button
            onClick={() => setActiveSubTab('repairs')}
            className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeSubTab === 'repairs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Lịch sử sửa chữa ({repairs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('qr')}
            className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeSubTab === 'qr'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Tem QR Code
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: THÔNG TIN & BẢO HÀNH */}
          {activeSubTab === 'info' && (
            <div className="space-y-6">
              {/* Warranty Progress Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Thời hạn bảo hành
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                      {warranty?.policyType || 'Bảo hành chính hãng'} ({warranty?.durationMonths || 12} tháng)
                    </h4>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-500">Ngày kết thúc:</span>
                    <p className="text-sm font-black text-slate-900">
                      {formatDate(warranty?.endDate)}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      warCalc.status === 'expired'
                        ? 'bg-rose-500'
                        : warCalc.status === 'expiring_soon'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${warCalc.progressPercent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                  <span>Bắt đầu: {formatDate(warranty?.startDate || asset.purchaseDate)}</span>
                  <span className="font-bold text-slate-800">
                    {warCalc.daysRemaining <= 0
                      ? 'Đã hết hạn'
                      : `Còn lại ${warCalc.daysRemaining} ngày`}
                  </span>
                </div>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Thông tin mua hàng */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Thông tin mua hàng
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Ngày mua:</span>
                      <strong className="text-slate-900">{formatDate(asset.purchaseDate)}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Giá mua:</span>
                      <strong className="text-slate-900 text-sm font-extrabold text-blue-600">
                        {formatVND(asset.purchasePrice)}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Nơi mua:</span>
                      <span className="text-slate-800 font-semibold">{asset.purchasePlace || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Số Serial:</span>
                      <span className="font-mono font-bold text-slate-800">{asset.serialNumber || 'Không có'}</span>
                    </div>
                    {asset.imei && (
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Số IMEI:</span>
                        <span className="font-mono font-bold text-slate-800">{asset.imei}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin bảo hành & liên hệ */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Trung tâm & Điều kiện bảo hành
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Nhà cung cấp / TTBH:</span>
                      <span className="text-slate-800 font-bold">{warranty?.provider || 'Hãng sản xuất'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Hotline CSKH:</span>
                      <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" />
                        {warranty?.hotline || 'Chưa có'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Tra cứu online:</span>
                      {warranty?.website ? (
                        <a
                          href={warranty.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Globe className="w-3 h-3" />
                          Website kiểm tra
                        </a>
                      ) : (
                        <span className="text-slate-400">Không có</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Điều kiện bảo hành:</span>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed text-[11px]">
                        {warranty?.terms || 'Bảo hành các lỗi phần cứng do nhà sản xuất. Không áp dụng vào nước, rơi vỡ hoặc tự ý can thiệp phần cứng.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Notes */}
              {asset.description && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Ghi chú thiết bị:</span>
                  <p className="text-slate-600 leading-relaxed">{asset.description}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HÓA ĐƠN & TÀI LIỆU (FR09) */}
          {activeSubTab === 'documents' && (
            <div className="space-y-6">
              {/* Document upload box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Tải lên hóa đơn & tài liệu mới
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Lưu trữ hóa đơn VAT, phiếu bảo hành, ảnh chụp thiết bị (JPG, PNG, PDF).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Tên tài liệu
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Hoa_don_VAT.pdf"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Loại tài liệu
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as DocumentType)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="invoice">Hóa đơn mua hàng (VAT)</option>
                      <option value="warranty_card">Phiếu bảo hành</option>
                      <option value="photo">Ảnh chụp thiết bị</option>
                      <option value="manual">Sách hướng dẫn sử dụng</option>
                      <option value="other">Tài liệu khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Chọn tệp đính kèm
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <span className="text-[11px] text-slate-400">Hoặc thêm nhanh mẫu:</span>
                  <button
                    onClick={() => handleAddSampleDoc('invoice')}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    + Mẫu Hóa đơn VAT
                  </button>
                  <button
                    onClick={() => handleAddSampleDoc('warranty_card')}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  >
                    + Mẫu Phiếu bảo hành
                  </button>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tài liệu đã lưu trữ ({documents.length})
                </h4>

                {documents.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">
                      Chưa có hóa đơn hoặc phiếu bảo hành nào được tải lên.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                            {doc.fileType === 'invoice' ? 'VAT' : doc.fileType === 'warranty_card' ? 'BH' : 'FILE'}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-800 truncate">
                              {doc.name}
                            </h5>
                            <p className="text-[11px] text-slate-400">
                              {doc.fileSize} • {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => setSelectedPreviewDoc(doc.fileUrl)}
                            className="p-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg font-semibold"
                            title="Xem trước"
                          >
                            Xem
                          </button>
                          <a
                            href={doc.fileUrl}
                            download={doc.name}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                            title="Tải về"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Xóa tài liệu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview image modal */}
              {selectedPreviewDoc && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                    <span className="text-xs font-bold">Xem trước tài liệu</span>
                    <button
                      onClick={() => setSelectedPreviewDoc(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Đóng
                    </button>
                  </div>
                  <div className="max-h-80 overflow-auto flex justify-center">
                    <img
                      src={selectedPreviewDoc}
                      alt="Preview"
                      className="rounded-lg max-h-72 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LỊCH SỬ SỬA CHỮA */}
          {activeSubTab === 'repairs' && (
            <div className="space-y-5">
              {/* Summary banner */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                    Tổng chi phí sửa chữa trên thiết bị này
                  </span>
                  <div className="text-xl font-black text-purple-900 mt-0.5">
                    {formatVND(totalRepairCost)}
                  </div>
                </div>

                <button
                  onClick={() => onAddRepair(asset.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ghi nhận sửa chữa mới
                </button>
              </div>

              {/* Repairs List */}
              {repairs.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Wrench className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">
                    Thiết bị này chưa từng qua sửa chữa hoặc bảo dưỡng.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {repairs.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">
                              {rep.description}
                            </span>
                            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              {formatVND(rep.cost)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Trung tâm: <strong className="text-slate-700">{rep.repairCenter}</strong> • Ngày: {formatDate(rep.repairDate)}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteRepair(rep.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Xóa bản ghi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {rep.note && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {rep.note}
                        </p>
                      )}

                      {rep.warrantyUntil && (
                        <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Linh kiện được bảo hành đến: {formatDate(rep.warrantyUntil)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TEM QR CODE & NHÃN DÁN */}
          {activeSubTab === 'qr' && (
            <div className="space-y-5 text-center">
              <div className="max-w-sm mx-auto p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 inline-block mb-3">
                  {/* SVG QR Code Simulation */}
                  <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="24" height="24" fill="#0f172a" />
                    <rect x="14" y="14" width="16" height="16" fill="white" />
                    <rect x="18" y="18" width="8" height="8" fill="#0f172a" />
                    <rect x="66" y="10" width="24" height="24" fill="#0f172a" />
                    <rect x="70" y="14" width="16" height="16" fill="white" />
                    <rect x="74" y="18" width="8" height="8" fill="#0f172a" />
                    <rect x="10" y="66" width="24" height="24" fill="#0f172a" />
                    <rect x="14" y="70" width="16" height="16" fill="white" />
                    <rect x="18" y="74" width="8" height="8" fill="#0f172a" />
                    {/* Pattern dots */}
                    <rect x="42" y="14" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="14" width="6" height="6" fill="#0f172a" />
                    <rect x="42" y="26" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="38" width="6" height="6" fill="#0f172a" />
                    <rect x="42" y="50" width="6" height="6" fill="#0f172a" />
                    <rect x="66" y="50" width="6" height="6" fill="#0f172a" />
                    <rect x="78" y="62" width="6" height="6" fill="#0f172a" />
                    <rect x="42" y="74" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="80" width="6" height="6" fill="#0f172a" />
                    <rect x="78" y="80" width="6" height="6" fill="#0f172a" />
                  </svg>
                </div>

                <h4 className="font-black text-sm text-slate-900">{asset.name}</h4>
                <p className="font-mono text-xs text-slate-600 mt-0.5">SN: {asset.serialNumber || 'N/A'}</p>
                <p className="text-[11px] text-slate-400 mt-1">Hạn BH: {formatDate(warranty?.endDate)}</p>

                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    In tem dán thiết bị
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(asset);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              Sửa thiết bị
            </button>
            <button
              onClick={() => {
                if (confirm(`Bạn có chắc chắn muốn xóa tài sản "${asset.name}"?`)) {
                  deleteAsset(asset.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
