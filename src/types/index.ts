/**
 * AssetCare - Type Definitions
 * Hệ thống Quản lý Thiết bị Điện tử và Thời hạn Bảo hành
 */

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultWarrantyMonths: number;
}

export type AssetStatus = 'active' | 'repairing' | 'disposed' | 'sold';

export interface Asset {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  imei?: string;
  purchaseDate: string; // YYYY-MM-DD
  purchasePrice: number; // VNĐ
  purchasePlace: string;
  description?: string;
  status: AssetStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired';

export interface Warranty {
  id: string;
  assetId: string;
  provider: string; // TTBH chính hãng, NPP (Apple Care, FPT Synnex, Digiworld...)
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationMonths: number;
  terms?: string;
  hotline?: string;
  website?: string;
  policyType?: string; // Bảo hành vàng, Đổi mới 1-1, Bảo hành chính hãng
  createdAt: string;
}

export type DocumentType = 'invoice' | 'warranty_card' | 'photo' | 'manual' | 'other';

export interface DocumentItem {
  id: string;
  assetId: string;
  name: string;
  fileUrl: string;
  fileType: DocumentType;
  fileSize: string;
  uploadedAt: string;
  note?: string;
}

export interface Repair {
  id: string;
  assetId: string;
  repairDate: string; // YYYY-MM-DD
  repairCenter: string;
  description: string;
  cost: number; // VNĐ
  note?: string;
  technician?: string;
  warrantyUntil?: string; // Hạn bảo hành linh kiện sau sửa
  createdAt: string;
}

export type NotificationType = 'warning_60' | 'warning_30' | 'danger_7' | 'expired' | 'maintenance' | 'system';

export interface NotificationItem {
  id: string;
  userId: string;
  assetId?: string;
  assetName?: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface WarrantyCalculation {
  status: WarrantyStatus;
  daysRemaining: number;
  totalDays: number;
  progressPercent: number; // 0 to 100 (% of warranty elapsed)
  statusLabel: string;
  badgeColor: string;
}
