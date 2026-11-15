import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { DashboardView } from './components/dashboard/DashboardView';
import { AssetsView } from './components/assets/AssetsView';
import { RepairsView } from './components/repairs/RepairsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AdminView } from './components/admin/AdminView';
import { AssetDetailModal } from './components/assets/AssetDetailModal';
import { AssetFormModal } from './components/assets/AssetFormModal';
import { AddRepairModal } from './components/repairs/AddRepairModal';
import { AssetQRCodeModal } from './components/assets/AssetQRCodeModal';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { Asset } from './types';
import { ShieldCheck, Heart } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, selectedAssetId, setSelectedAssetId, getAssetWarranty } = useApp();

  // Modal states
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showAddRepairModal, setShowAddRepairModal] = useState(false);
  const [repairTargetAssetId, setRepairTargetAssetId] = useState<string | null>(null);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Handlers
  const handleOpenAddAsset = () => {
    setEditingAsset(null);
    setShowAddAssetModal(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowAddAssetModal(true);
  };

  const handleOpenAddRepair = (assetId?: string) => {
    setRepairTargetAssetId(assetId || null);
    setShowAddRepairModal(true);
  };

  const handleShowQR = (asset: Asset) => {
    setQrAsset(asset);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        onOpenAddModal={handleOpenAddAsset}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenProfileModal={() => setShowProfileModal(true)}
      />

      {/* Main Navigation Tabs */}
      <Navigation />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenAddModal={handleOpenAddAsset}
            onOpenAddRepairModal={() => handleOpenAddRepair()}
          />
        )}

        {activeTab === 'assets' && (
          <AssetsView
            onOpenAddModal={handleOpenAddAsset}
            onEditAsset={handleEditAsset}
            onAddRepair={handleOpenAddRepair}
            onShowQR={handleShowQR}
          />
        )}

        {activeTab === 'repairs' && (
          <RepairsView onOpenAddRepairModal={handleOpenAddRepair} />
        )}

        {activeTab === 'notifications' && <NotificationsView />}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'admin' && <AdminView />}
      </main>

      {/* Global Modals */}
      {selectedAssetId && (
        <AssetDetailModal
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
          onEdit={handleEditAsset}
          onAddRepair={handleOpenAddRepair}
          onShowQR={handleShowQR}
        />
      )}

      {showAddAssetModal && (
        <AssetFormModal
          initialAsset={editingAsset}
          onClose={() => {
            setShowAddAssetModal(false);
            setEditingAsset(null);
          }}
        />
      )}

      {showAddRepairModal && (
        <AddRepairModal
          preselectedAssetId={repairTargetAssetId}
          onClose={() => {
            setShowAddRepairModal(false);
            setRepairTargetAssetId(null);
          }}
        />
      )}

      {qrAsset && (
        <AssetQRCodeModal
          asset={qrAsset}
          warranty={getAssetWarranty(qrAsset.id)}
          onClose={() => setQrAsset(null)}
        />
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              AC
            </div>
            <span className="font-bold text-slate-700">AssetCare</span>
            <span>—</span>
            <span>Hệ thống Quản lý Thiết bị Điện tử và Thời hạn Bảo hành</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>© 2026 AssetCare Inc. Bảo mật & Tiện ích cá nhân</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
