import React, { useState } from 'react';
import { X, Wrench, Calendar, DollarSign, Building, UserCheck, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { addMonths } from '../../utils/formatters';

interface AddRepairModalProps {
  preselectedAssetId?: string | null;
  onClose: () => void;
}

export const AddRepairModal: React.FC<AddRepairModalProps> = ({
  preselectedAssetId,
  onClose,
}) => {
  const { assets, addRepair } = useApp();

  const [assetId, setAssetId] = useState(preselectedAssetId || assets[0]?.id || '');
  const [repairDate, setRepairDate] = useState('2026-11-09');
  const [repairCenter, setRepairCenter] = useState('CareS - TTBH Ủy Quyền Apple');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState<number>(450000);
  const [note, setNote] = useState('');
  const [technician, setTechnician] = useState('');
  const [hasWarrantyOnPart, setHasWarrantyOnPart] = useState(true);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Vui lòng nhập nội dung sửa chữa!');
      return;
    }
    if (!assetId) {
      alert('Vui lòng chọn thiết bị sửa chữa!');
      return;
    }

    const warrantyUntil = hasWarrantyOnPart ? addMonths(repairDate, warrantyMonths) : undefined;

    addRepair({
      assetId,
      repairDate,
      repairCenter: repairCenter || 'Trung tâm sửa chữa',
      description,
      cost: Number(cost),
      note,
      technician,
      warrantyUntil,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Ghi Nhận Lịch Sử Sửa Chữa
              </h3>
              <p className="text-[11px] text-slate-400">
                Lưu lại chi phí, linh kiện thay thế và đơn vị thực hiện
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Thiết bị cần sửa chữa <span className="text-rose-500">*</span>
            </label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.brand} - {a.serialNumber || 'Không có SN'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nội dung sửa chữa / Bảo dưỡng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Thay pin dung lượng cao, vệ sinh tản nhiệt, ép kính..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày sửa chữa <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={repairDate}
                onChange={(e) => setRepairDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Chi phí (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={10000}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold text-purple-700 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Đơn vị / Cửa hàng sửa chữa
              </label>
              <input
                type="text"
                placeholder="CareS, FPT Services, Điện Thoại Vui..."
                value={repairCenter}
                onChange={(e) => setRepairCenter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Kỹ thuật viên thực hiện
              </label>
              <input
                type="text"
                placeholder="Tên kỹ thuật viên..."
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Ghi chú tình trạng</label>
            <textarea
              rows={2}
              placeholder="Ghi chú chi tiết: pin chai bao nhiêu %, linh kiện zin hay OEM..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          {/* Warranty on repaired part */}
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-900">
              <input
                type="checkbox"
                checked={hasWarrantyOnPart}
                onChange={(e) => setHasWarrantyOnPart(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              Linh kiện sau sửa chữa có bảo hành riêng
            </label>

            {hasWarrantyOnPart && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-slate-600">Thời hạn bảo hành linh kiện:</span>
                <select
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                  className="px-2 py-1 bg-white border border-purple-300 rounded-lg font-bold text-purple-700"
                >
                  <option value={1}>1 tháng</option>
                  <option value={3}>3 tháng</option>
                  <option value={6}>6 tháng</option>
                  <option value={12}>12 tháng</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition-colors"
            >
              Lưu lịch sử sửa chữa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
