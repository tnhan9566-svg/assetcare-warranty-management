import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Save,
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  Camera,
  Home,
  Cpu,
  Calendar,
  DollarSign,
  Tag,
  Building,
  ShieldCheck,
  PhoneCall,
  Globe,
  Upload,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Asset, Warranty, DocumentType } from '../../types';
import { addMonths, formatDate } from '../../utils/formatters';

interface AssetFormModalProps {
  initialAsset?: Asset | null;
  onClose: () => void;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  initialAsset,
  onClose,
}) => {
  const { categories, warranties, addAsset, updateAsset, getAssetWarranty } = useApp();

  const isEditing = Boolean(initialAsset);
  const existingWarranty = initialAsset ? getAssetWarranty(initialAsset.id) : null;

  // Form tab
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Asset Basic Info
  const [name, setName] = useState(initialAsset?.name || '');
  const [categoryId, setCategoryId] = useState(
    initialAsset?.categoryId || categories[0]?.id || 'cat_laptop'
  );
  const [brand, setBrand] = useState(initialAsset?.brand || '');
  const [model, setModel] = useState(initialAsset?.model || '');
  const [serialNumber, setSerialNumber] = useState(initialAsset?.serialNumber || '');
  const [imei, setImei] = useState(initialAsset?.imei || '');
  const [purchaseDate, setPurchaseDate] = useState(
    initialAsset?.purchaseDate || '2026-10-01'
  );
  const [purchasePrice, setPurchasePrice] = useState<number>(
    initialAsset?.purchasePrice || 15000000
  );
  const [purchasePlace, setPurchasePlace] = useState(
    initialAsset?.purchasePlace || 'Thế Giới Di Động'
  );
  const [description, setDescription] = useState(initialAsset?.description || '');
  const [imageUrl, setImageUrl] = useState(initialAsset?.imageUrl || '');

  // Warranty Info
  const [provider, setProvider] = useState(existingWarranty?.provider || 'TTBH Chính Hãng');
  const [durationMonths, setDurationMonths] = useState<number>(
    existingWarranty?.durationMonths || 12
  );
  const [startDate, setStartDate] = useState(
    existingWarranty?.startDate || purchaseDate || '2026-10-01'
  );
  const [endDate, setEndDate] = useState(
    existingWarranty?.endDate || addMonths(purchaseDate || '2026-10-01', 12)
  );
  const [terms, setTerms] = useState(
    existingWarranty?.terms ||
      'Bảo hành 1 đổi 1 trong 30 ngày đầu, bảo hành phần cứng lỗi sản xuất.'
  );
  const [hotline, setHotline] = useState(existingWarranty?.hotline || '1800 1127');
  const [website, setWebsite] = useState(existingWarranty?.website || '');
  const [policyType, setPolicyType] = useState(
    existingWarranty?.policyType || 'Bảo hành chính hãng'
  );

  // Initial Document (optional for new asset)
  const [hasInitialDoc, setHasInitialDoc] = useState(false);
  const [docName, setDocName] = useState('Hoa_don_mua_hang.pdf');
  const [docType, setDocType] = useState<DocumentType>('invoice');

  // When purchaseDate or durationMonths change, auto update endDate
  useEffect(() => {
    if (!isEditing && purchaseDate) {
      setStartDate(purchaseDate);
      setEndDate(addMonths(purchaseDate, durationMonths));
    }
  }, [purchaseDate, durationMonths, isEditing]);

  // When category changes, set default warranty months
  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    const cat = categories.find((c) => c.id === newCatId);
    if (cat && !isEditing) {
      setDurationMonths(cat.defaultWarrantyMonths);
      setEndDate(addMonths(purchaseDate, cat.defaultWarrantyMonths));
    }
  };

  // Quick preset photos
  const presetPhotos = [
    { label: 'Laptop', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80' },
    { label: 'iPhone', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80' },
    { label: 'Tai nghe', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
    { label: 'Gia dụng', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80' },
    { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80' },
    { label: 'Máy ảnh', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên thiết bị!');
      setActiveStep(1);
      return;
    }

    if (isEditing && initialAsset) {
      updateAsset(
        initialAsset.id,
        {
          name,
          categoryId,
          brand,
          model,
          serialNumber,
          imei,
          purchaseDate,
          purchasePrice: Number(purchasePrice),
          purchasePlace,
          description,
          imageUrl: imageUrl || presetPhotos[0].url,
        },
        {
          provider,
          startDate,
          endDate,
          durationMonths: Number(durationMonths),
          terms,
          hotline,
          website,
          policyType,
        }
      );
    } else {
      addAsset(
        {
          categoryId,
          name,
          brand: brand || 'Khác',
          model: model || 'Tiêu chuẩn',
          serialNumber: serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
          imei: imei || undefined,
          purchaseDate,
          purchasePrice: Number(purchasePrice),
          purchasePlace,
          description,
          status: 'active',
          imageUrl: imageUrl || presetPhotos[0].url,
        },
        {
          provider,
          startDate,
          endDate,
          durationMonths: Number(durationMonths),
          terms,
          hotline,
          website,
          policyType,
        },
        hasInitialDoc
          ? {
              name: docName,
              fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
              fileType: docType,
              fileSize: '1.2 MB',
              note: 'Hóa đơn kèm theo lúc tạo mới thiết bị',
            }
          : undefined
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {isEditing ? 'Chỉnh Sửa Thiết Bị' : 'Thêm Thiết Bị Mới'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhập thông tin sản phẩm, ngày mua và cấu hình thời hạn bảo hành
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress tabs */}
        <div className="flex border-b border-slate-200 text-xs font-bold bg-white">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeStep === 1
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
              1
            </span>
            Thông tin thiết bị
          </button>
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeStep === 2
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
              2
            </span>
            Mua hàng & Bảo hành
          </button>
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeStep === 3
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
              3
            </span>
            Tài liệu & Hình ảnh
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* STEP 1: THÔNG TIN THIẾT BỊ */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên tài sản / Thiết bị <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Laptop Dell XPS 15 9530, iPhone 16 Pro Max..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Danh mục thiết bị <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (BH chuẩn: {c.defaultWarrantyMonths} tháng)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Thương hiệu sản xuất <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Apple, Dell, Sony, Samsung, Dyson..."
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Model / Mã máy</label>
                  <input
                    type="text"
                    placeholder="VD: XPS-9530, A3296..."
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Số Serial Number (S/N)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: DLXPS-8821B..."
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số IMEI (nếu có)</label>
                  <input
                    type="text"
                    placeholder="15 chữ số IMEI..."
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả / Ghi chú</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm về phụ kiện đi kèm, tình trạng máy khi mua..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700"
                >
                  Tiếp theo: Mua hàng & Bảo hành →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MUA HÀNG & BẢO HÀNH */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Cơ chế tự động xác định thời hạn bảo hành
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Hệ thống tự động cộng số tháng bảo hành vào ngày mua để tính chính xác ngày hết hạn,
                  đồng thời kích hoạt chu kỳ cảnh báo 60 ngày, 30 ngày và 7 ngày trước khi hết hạn.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Ngày mua hàng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Giá mua (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100000}
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nơi mua hàng</label>
                  <input
                    type="text"
                    placeholder="Thế Giới Di Động, FPT Shop..."
                    value={purchasePlace}
                    onChange={(e) => setPurchasePlace(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Thời hạn bảo hành (Tháng)
                  </label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl font-bold text-blue-700"
                  >
                    <option value={3}>3 tháng</option>
                    <option value={6}>6 tháng</option>
                    <option value={12}>12 tháng (1 năm)</option>
                    <option value={24}>24 tháng (2 năm)</option>
                    <option value={36}>36 tháng (3 năm)</option>
                    <option value={60}>60 tháng (5 năm)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày bắt đầu BH</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Ngày kết thúc BH (Tự tính)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nhà phân phối / TTBH chính hãng
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Apple Care, FPT Synnex, Digiworld..."
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hotline CSKH / Bảo hành</label>
                  <input
                    type="text"
                    placeholder="VD: 1800 1127, 1900 6601..."
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Website tra cứu BH</label>
                  <input
                    type="text"
                    placeholder="https://checkcoverage.apple.com..."
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gói bảo hành</label>
                  <input
                    type="text"
                    placeholder="Chính hãng, VIP Care, Đổi mới 1-1..."
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Điều kiện bảo hành</label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                >
                  ← Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                  Tiếp theo: Ảnh & Tài liệu →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TÀI LIỆU & HÌNH ẢNH */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Chọn ảnh minh họa thiết bị
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {presetPhotos.map((preset) => (
                    <div
                      key={preset.label}
                      onClick={() => setImageUrl(preset.url)}
                      className={`cursor-pointer rounded-xl border p-1 text-center transition-all ${
                        imageUrl === preset.url
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-12 object-cover rounded-lg mb-1"
                      />
                      <span className="text-[10px] font-semibold text-slate-700 block truncate">
                        {preset.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-2">
                  <label className="font-semibold text-slate-600 block mb-1 text-[11px]">
                    Hoặc dán URL hình ảnh tùy chỉnh:
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {!isEditing && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={hasInitialDoc}
                      onChange={(e) => setHasInitialDoc(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    Đính kèm hóa đơn mua hàng ngay bây giờ
                  </label>

                  {hasInitialDoc && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Tên hóa đơn
                        </label>
                        <input
                          type="text"
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Loại
                        </label>
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value as DocumentType)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl"
                        >
                          <option value="invoice">Hóa đơn mua hàng (VAT)</option>
                          <option value="warranty_card">Phiếu bảo hành</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                >
                  ← Quay lại
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 transition-all text-xs sm:text-sm active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Lưu cập nhật' : 'Hoàn tất & Thêm thiết bị'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
