import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Asset,
  Category,
  DocumentItem,
  NotificationItem,
  Repair,
  User,
  Warranty,
  ActivityLog,
  DocumentType,
} from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_CATEGORIES,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPAIRS,
  INITIAL_USERS,
  INITIAL_WARRANTIES,
  INITIAL_ACTIVITY_LOGS,
} from '../data/initialData';
import { calculateWarranty, generateId } from '../utils/formatters';

interface AppContextType {
  currentUser: User;
  users: User[];
  categories: Category[];
  assets: Asset[];
  allAssets: Asset[]; // for admin
  warranties: Warranty[];
  documents: DocumentItem[];
  repairs: Repair[];
  notifications: NotificationItem[];
  activityLogs: ActivityLog[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;

  // User & Auth
  switchUser: (userId: string) => void;
  login: (email: string, password: string) => boolean;
  register: (fullName: string, email: string, password: string) => boolean;
  updateUserProfile: (data: Partial<User>) => void;

  // Asset CRUD
  addAsset: (
    assetData: Omit<Asset, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    warrantyData: Omit<Warranty, 'id' | 'assetId' | 'createdAt'>,
    initialDoc?: { name: string; fileUrl: string; fileType: DocumentType; fileSize: string; note?: string }
  ) => string;
  updateAsset: (id: string, assetData: Partial<Asset>, warrantyData?: Partial<Warranty>) => void;
  deleteAsset: (id: string) => void;

  // Documents
  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploadedAt'>) => void;
  deleteDocument: (id: string) => void;

  // Repairs
  addRepair: (repair: Omit<Repair, 'id' | 'createdAt'>) => void;
  deleteRepair: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Categories (Admin)
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Admin user management
  updateUserStatus: (userId: string, status: 'active' | 'inactive') => void;
  updateUserRole: (userId: string, role: 'user' | 'admin') => void;

  // Utilities
  resetToSampleData: () => void;
  getAssetWarranty: (assetId: string) => Warranty | undefined;
  getAssetDocuments: (assetId: string) => DocumentItem[];
  getAssetRepairs: (assetId: string) => Repair[];
}

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'assetcare_current_user_id',
  USERS: 'assetcare_users',
  CATEGORIES: 'assetcare_categories',
  ASSETS: 'assetcare_assets',
  WARRANTIES: 'assetcare_warranties',
  DOCUMENTS: 'assetcare_documents',
  REPAIRS: 'assetcare_repairs',
  NOTIFICATIONS: 'assetcare_notifications',
  LOGS: 'assetcare_activity_logs',
};

async function apiCall(url: string, method: string, body?: unknown): Promise<void> {
  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    console.error(`[AssetCare API] ${method} ${url} failed:`, err);
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dbConnectedRef = useRef<boolean>(false);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'user_1';
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [warranties, setWarranties] = useState<Warranty[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WARRANTIES);
    return saved ? JSON.parse(saved) : INITIAL_WARRANTIES;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [repairs, setRepairs] = useState<Repair[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPAIRS);
    return saved ? JSON.parse(saved) : INITIAL_REPAIRS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Hydrate from SQL Server backend if DB_ENABLED=true and connected
  useEffect(() => {
    let active = true;
    fetch('/api/bootstrap')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data || !data.dbConnected) return;
        dbConnectedRef.current = true;
        if (Array.isArray(data.users) && data.users.length > 0) setUsers(data.users);
        if (Array.isArray(data.categories)) setCategories(data.categories);
        if (Array.isArray(data.assets)) setAssets(data.assets);
        if (Array.isArray(data.warranties)) setWarranties(data.warranties);
        if (Array.isArray(data.documents)) setDocuments(data.documents);
        if (Array.isArray(data.repairs)) setRepairs(data.repairs);
        if (Array.isArray(data.notifications)) setNotifications(data.notifications);
        if (Array.isArray(data.activityLogs)) setActivityLogs(data.activityLogs);
      })
      .catch(() => {
        // Fallback silently to localStorage mode when running standalone
      });
    return () => {
      active = false;
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WARRANTIES, JSON.stringify(warranties));
  }, [warranties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(repairs));
  }, [repairs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Current user resolution
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Helper log activity
  const logActivity = (action: string, description: string, actor?: User) => {
    const u = actor || currentUser;
    const newLog: ActivityLog = {
      id: generateId('log'),
      userId: u.id,
      userName: u.fullName,
      action,
      description,
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
    if (dbConnectedRef.current) {
      void apiCall('/api/logs', 'POST', newLog);
    }
  };

  // User-scoped assets vs Admin assets
  const userAssets = currentUser.role === 'admin' ? assets : assets.filter((a) => a.userId === currentUser.id);

  // Switch User
  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUserId(userId);
      logActivity('Đổi người dùng', `Chuyển sang tài khoản ${user.fullName} (${user.role})`, user);
    }
  };

  const login = (email: string) => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUserId(found.id);
      logActivity('Đăng nhập', `Đăng nhập thành công với email ${email}`, found);
      return true;
    }
    return false;
  };

  const register = (fullName: string, email: string, password = '123456') => {
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }
    const newUser: User = {
      id: generateId('user'),
      fullName,
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'user',
      phone: '',
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    if (dbConnectedRef.current) {
      void apiCall('/api/auth/register', 'POST', { ...newUser, password });
    }
    logActivity('Đăng ký tài khoản', `Người dùng mới: ${fullName} (${email})`, newUser);
    return true;
  };

  const updateUserProfile = (data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...data } : u))
    );
    if (dbConnectedRef.current) {
      void apiCall(`/api/users/${currentUser.id}`, 'PUT', data);
    }
    logActivity('Cập nhật hồ sơ', 'Người dùng cập nhật thông tin cá nhân');
  };

  // Add Asset
  const addAsset = (
    assetData: Omit<Asset, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    warrantyData: Omit<Warranty, 'id' | 'assetId' | 'createdAt'>,
    initialDoc?: { name: string; fileUrl: string; fileType: DocumentType; fileSize: string; note?: string }
  ): string => {
    const assetId = generateId('asset');
    const nowIso = new Date().toISOString();

    const newAsset: Asset = {
      ...assetData,
      id: assetId,
      userId: currentUser.id,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const newWarranty: Warranty = {
      ...warrantyData,
      id: generateId('war'),
      assetId: assetId,
      createdAt: nowIso,
    };

    let createdDoc: DocumentItem | null = null;
    if (initialDoc && initialDoc.fileUrl) {
      createdDoc = {
        id: generateId('doc'),
        assetId: assetId,
        name: initialDoc.name || 'Hóa đơn mua hàng',
        fileUrl: initialDoc.fileUrl,
        fileType: initialDoc.fileType || 'invoice',
        fileSize: initialDoc.fileSize || '1.2 MB',
        uploadedAt: nowIso,
        note: initialDoc.note,
      };
    }

    let createdNotif: NotificationItem | null = null;
    const warCalc = calculateWarranty(newWarranty.startDate, newWarranty.endDate);
    if (warCalc.daysRemaining <= 30 && warCalc.daysRemaining >= 0) {
      createdNotif = {
        id: generateId('notif'),
        userId: currentUser.id,
        assetId: assetId,
        assetName: newAsset.name,
        title: `🟡 Cảnh báo: Thiết bị còn ${warCalc.daysRemaining} ngày bảo hành`,
        message: `Tài sản ${newAsset.name} sẽ hết hạn bảo hành vào ngày ${newWarranty.endDate}. Vui lòng kiểm tra tình trạng máy!`,
        type: warCalc.daysRemaining <= 7 ? 'danger_7' : 'warning_30',
        isRead: false,
        createdAt: nowIso,
      };
    }

    setAssets((prev) => [newAsset, ...prev]);
    setWarranties((prev) => [newWarranty, ...prev]);
    if (createdDoc) setDocuments((prev) => [createdDoc!, ...prev]);
    if (createdNotif) setNotifications((prev) => [createdNotif!, ...prev]);

    if (dbConnectedRef.current) {
      void apiCall('/api/assets', 'POST', {
        asset: newAsset,
        warranty: newWarranty,
        document: createdDoc,
        notification: createdNotif,
      });
    }

    logActivity('Thêm tài sản', `Đã thêm tài sản mới: ${newAsset.name} (${newAsset.brand})`);
    return assetId;
  };

  const updateAsset = (id: string, assetData: Partial<Asset>, warrantyData?: Partial<Warranty>) => {
    const nowIso = new Date().toISOString();
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...assetData, updatedAt: nowIso } : a))
    );

    if (warrantyData) {
      setWarranties((prev) =>
        prev.map((w) => (w.assetId === id ? { ...w, ...warrantyData } : w))
      );
    }

    if (dbConnectedRef.current) {
      void apiCall(`/api/assets/${id}`, 'PUT', { assetData, warrantyData });
    }

    logActivity('Cập nhật tài sản', `Đã chỉnh sửa thông tin tài sản ID: ${id}`);
  };

  const deleteAsset = (id: string) => {
    const target = assets.find((a) => a.id === id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setWarranties((prev) => prev.filter((w) => w.assetId !== id));
    setDocuments((prev) => prev.filter((d) => d.assetId !== id));
    setRepairs((prev) => prev.filter((r) => r.assetId !== id));
    setNotifications((prev) => prev.filter((n) => n.assetId !== id));

    if (selectedAssetId === id) {
      setSelectedAssetId(null);
    }

    if (dbConnectedRef.current) {
      void apiCall(`/api/assets/${id}`, 'DELETE');
    }

    logActivity('Xóa tài sản', `Đã xóa tài sản: ${target?.name || id}`);
  };

  // Document CRUD
  const addDocument = (doc: Omit<DocumentItem, 'id' | 'uploadedAt'>) => {
    const newDoc: DocumentItem = {
      ...doc,
      id: generateId('doc'),
      uploadedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    if (dbConnectedRef.current) {
      void apiCall('/api/documents', 'POST', newDoc);
    }
    logActivity('Tải lên tài liệu', `Đã thêm tài liệu: ${newDoc.name}`);
  };

  const deleteDocument = (id: string) => {
    const target = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (dbConnectedRef.current) {
      void apiCall(`/api/documents/${id}`, 'DELETE');
    }
    logActivity('Xóa tài liệu', `Đã xóa tài liệu: ${target?.name || id}`);
  };

  // Repair CRUD
  const addRepair = (repair: Omit<Repair, 'id' | 'createdAt'>) => {
    const newRepair: Repair = {
      ...repair,
      id: generateId('rep'),
      createdAt: new Date().toISOString(),
    };
    setRepairs((prev) => [newRepair, ...prev]);
    if (dbConnectedRef.current) {
      void apiCall('/api/repairs', 'POST', newRepair);
    }

    const asset = assets.find((a) => a.id === repair.assetId);
    logActivity(
      'Ghi nhận sửa chữa',
      `Sửa chữa cho ${asset?.name || 'thiết bị'}: ${repair.description} (${repair.cost} ₫)`
    );
  };

  const deleteRepair = (id: string) => {
    setRepairs((prev) => prev.filter((r) => r.id !== id));
    if (dbConnectedRef.current) {
      void apiCall(`/api/repairs/${id}`, 'DELETE');
    }
    logActivity('Xóa lịch sử sửa chữa', 'Đã xóa hồ sơ sửa chữa');
  };

  // Notification CRUD
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (dbConnectedRef.current) {
      void apiCall(`/api/notifications/${id}/read`, 'PUT');
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, isRead: true } : n))
    );
    if (dbConnectedRef.current) {
      void apiCall('/api/notifications/read-all', 'PUT', { userId: currentUser.id });
    }
  };

  // Category CRUD
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: generateId('cat'),
    };
    setCategories((prev) => [...prev, newCat]);
    if (dbConnectedRef.current) {
      void apiCall('/api/categories', 'POST', newCat);
    }
    logActivity('Thêm danh mục', `Quản trị viên thêm danh mục: ${newCat.name}`);
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    if (dbConnectedRef.current) {
      void apiCall(`/api/categories/${id}`, 'PUT', data);
    }
    logActivity('Cập nhật danh mục', 'Chỉnh sửa danh mục');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (dbConnectedRef.current) {
      void apiCall(`/api/categories/${id}`, 'DELETE');
    }
    logActivity('Xóa danh mục', 'Đã xóa danh mục');
  };

  // Admin user controls
  const updateUserStatus = (userId: string, status: 'active' | 'inactive') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
    if (dbConnectedRef.current) {
      void apiCall(`/api/users/${userId}`, 'PUT', { status });
    }
    logActivity('Cập nhật người dùng', `Thay đổi trạng thái tài khoản sang ${status}`);
  };

  const updateUserRole = (userId: string, role: 'user' | 'admin') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
    if (dbConnectedRef.current) {
      void apiCall(`/api/users/${userId}`, 'PUT', { role });
    }
    logActivity('Phân quyền người dùng', `Cập nhật quyền hạn sang ${role}`);
  };

  // Reset to initial sample data
  const resetToSampleData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUserId('user_1');
    setCategories(INITIAL_CATEGORIES);
    setAssets(INITIAL_ASSETS);
    setWarranties(INITIAL_WARRANTIES);
    setDocuments(INITIAL_DOCUMENTS);
    setRepairs(INITIAL_REPAIRS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setSelectedAssetId(null);
  };

  // Helper selectors
  const getAssetWarranty = (assetId: string) => warranties.find((w) => w.assetId === assetId);
  const getAssetDocuments = (assetId: string) => documents.filter((d) => d.assetId === assetId);
  const getAssetRepairs = (assetId: string) => repairs.filter((r) => r.assetId === assetId);

  const userNotifications = currentUser.role === 'admin'
    ? notifications
    : notifications.filter((n) => n.userId === currentUser.id);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        categories,
        assets: userAssets,
        allAssets: assets,
        warranties,
        documents,
        repairs,
        notifications: userNotifications,
        activityLogs,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedAssetId,
        setSelectedAssetId,
        switchUser,
        login,
        register,
        updateUserProfile,
        addAsset,
        updateAsset,
        deleteAsset,
        addDocument,
        deleteDocument,
        addRepair,
        deleteRepair,
        markNotificationRead,
        markAllNotificationsRead,
        addCategory,
        updateCategory,
        deleteCategory,
        updateUserStatus,
        updateUserRole,
        resetToSampleData,
        getAssetWarranty,
        getAssetDocuments,
        getAssetRepairs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
