import React from 'react';
import { X, Printer, ShieldCheck, Tag, Calendar, Download } from 'lucide-react';
import { Asset, Warranty } from '../../types';
import { formatDate } from '../../utils/formatters';

interface AssetQRCodeModalProps {
  asset: Asset;
  warranty?: Warranty;
  onClose: () => void;
}

export const AssetQRCodeModal: React.FC<AssetQRCodeModalProps> = ({
  asset,
  warranty,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-800">
              Tem Nhãn & QR Code Thiết Bị
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 text-center">
          <div
            id="printable-tag"
            className="p-5 rounded-2xl border-2 border-slate-900 bg-white text-slate-900 text-left shadow-md inline-block w-full max-w-sm"
          >
            {/* Top brand */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span className="font-black text-xs tracking-wider">
                  ASSET<span className="text-blue-600">CARE</span> TAG
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                ID: {asset.id.slice(-6).toUpperCase()}
              </span>
            </div>

            {/* QR code and details */}
            <div className="py-4 flex items-center gap-4">
              {/* QR Code SVG */}
              <div className="w-28 h-28 bg-slate-50 p-2 rounded-xl border border-slate-200 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="white" />
                  <rect x="8" y="8" width="26" height="26" fill="#0f172a" />
                  <rect x="12" y="12" width="18" height="18" fill="white" />
                  <rect x="16" y="16" width="10" height="10" fill="#0f172a" />
                  <rect x="66" y="8" width="26" height="26" fill="#0f172a" />
                  <rect x="70" y="12" width="18" height="18" fill="white" />
                  <rect x="74" y="16" width="10" height="10" fill="#0f172a" />
                  <rect x="8" y="66" width="26" height="26" fill="#0f172a" />
                  <rect x="12" y="70" width="18" height="18" fill="white" />
                  <rect x="16" y="74" width="10" height="10" fill="#0f172a" />
                  {/* Random pattern data */}
                  <rect x="40" y="12" width="8" height="8" fill="#0f172a" />
                  <rect x="52" y="12" width="6" height="6" fill="#0f172a" />
                  <rect x="40" y="24" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="32" width="8" height="8" fill="#0f172a" />
                  <rect x="40" y="44" width="8" height="8" fill="#0f172a" />
                  <rect x="68" y="44" width="6" height="6" fill="#0f172a" />
                  <rect x="80" y="56" width="8" height="8" fill="#0f172a" />
                  <rect x="40" y="68" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="76" width="8" height="8" fill="#0f172a" />
                  <rect x="76" y="76" width="8" height="8" fill="#0f172a" />
                </svg>
              </div>

              {/* Tag information */}
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="font-extrabold text-xs text-slate-900 leading-tight line-clamp-2">
                  {asset.name}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  {asset.brand} - {asset.model}
                </p>
                <div className="pt-1">
                  <p className="text-[9px] font-mono text-slate-600 truncate">
                    SN: {asset.serialNumber || 'N/A'}
                  </p>
                  <p className="text-[9px] text-slate-600">
                    Mua: {formatDate(asset.purchaseDate)}
                  </p>
                  <p className="text-[9px] font-bold text-blue-700">
                    Hạn BH: {formatDate(warranty?.endDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom warning */}
            <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-500 text-center font-medium">
              Quét QR để kiểm tra bảo hành & lịch sử sửa chữa
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4">
            Dán tem này lên thân thiết bị để tra cứu nhanh thông tin bảo hành bất cứ lúc nào.
          </p>

          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              In tem nhãn dán
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
