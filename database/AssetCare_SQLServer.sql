-- ============================================================================
-- ASSETCARE - PERSONAL ASSET & WARRANTY MANAGEMENT SYSTEM
-- Script tạo Cơ sở dữ liệu Microsoft SQL Server (SSMS 19 / 20 / 22)
-- ============================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'AssetCareDB')
BEGIN
    CREATE DATABASE AssetCareDB;
END
GO

USE AssetCareDB;
GO

-- Xóa bảng cũ nếu muốn tạo lại từ đầu (theo đúng thứ tự khóa ngoại)
IF OBJECT_ID('dbo.ActivityLogs', 'U') IS NOT NULL DROP TABLE dbo.ActivityLogs;
IF OBJECT_ID('dbo.Suppliers', 'U') IS NOT NULL DROP TABLE dbo.Suppliers;
IF OBJECT_ID('dbo.Maintenance', 'U') IS NOT NULL DROP TABLE dbo.Maintenance;
IF OBJECT_ID('dbo.Notifications', 'U') IS NOT NULL DROP TABLE dbo.Notifications;
IF OBJECT_ID('dbo.Repairs', 'U') IS NOT NULL DROP TABLE dbo.Repairs;
IF OBJECT_ID('dbo.Documents', 'U') IS NOT NULL DROP TABLE dbo.Documents;
IF OBJECT_ID('dbo.Warranties', 'U') IS NOT NULL DROP TABLE dbo.Warranties;
IF OBJECT_ID('dbo.Assets', 'U') IS NOT NULL DROP TABLE dbo.Assets;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- ============================================================================
-- 1. BẢNG USERS (Người dùng & Quản trị viên)
-- ============================================================================
CREATE TABLE dbo.Users (
    id NVARCHAR(50) PRIMARY KEY,
    full_name NVARCHAR(150) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL DEFAULT N'123456',
    avatar NVARCHAR(500) NULL,
    role NVARCHAR(20) NOT NULL DEFAULT N'user' CHECK (role IN (N'user', N'admin')),
    phone NVARCHAR(30) NULL,
    status NVARCHAR(20) NOT NULL DEFAULT N'active' CHECK (status IN (N'active', N'inactive')),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- ============================================================================
-- 2. BẢNG CATEGORIES (Danh mục thiết bị)
-- ============================================================================
CREATE TABLE dbo.Categories (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(120) NOT NULL,
    icon NVARCHAR(50) NOT NULL DEFAULT N'Cpu',
    description NVARCHAR(500) NULL,
    default_warranty_months INT NOT NULL DEFAULT 12
);
GO

-- ============================================================================
-- 3. BẢNG ASSETS (Tài sản & Thiết bị điện tử)
-- ============================================================================
CREATE TABLE dbo.Assets (
    id NVARCHAR(50) PRIMARY KEY,
    user_id NVARCHAR(50) NOT NULL,
    category_id NVARCHAR(50) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    brand NVARCHAR(100) NOT NULL,
    model NVARCHAR(100) NULL,
    serial_number NVARCHAR(100) NULL,
    imei NVARCHAR(100) NULL,
    purchase_date DATE NOT NULL,
    purchase_price DECIMAL(18, 0) NOT NULL DEFAULT 0,
    purchase_place NVARCHAR(255) NULL,
    description NVARCHAR(MAX) NULL,
    status NVARCHAR(30) NOT NULL DEFAULT N'active' CHECK (status IN (N'active', N'repairing', N'disposed', N'sold')),
    image_url NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Assets_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Assets_Categories FOREIGN KEY (category_id) REFERENCES dbo.Categories(id)
);
GO

-- ============================================================================
-- 4. BẢNG WARRANTIES (Thông tin bảo hành)
-- ============================================================================
CREATE TABLE dbo.Warranties (
    id NVARCHAR(50) PRIMARY KEY,
    asset_id NVARCHAR(50) NOT NULL,
    provider NVARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_months INT NOT NULL DEFAULT 12,
    terms NVARCHAR(MAX) NULL,
    hotline NVARCHAR(50) NULL,
    website NVARCHAR(300) NULL,
    policy_type NVARCHAR(150) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Warranties_Assets FOREIGN KEY (asset_id) REFERENCES dbo.Assets(id) ON DELETE CASCADE
);
GO

-- ============================================================================
-- 5. BẢNG DOCUMENTS (Hóa đơn, Phiếu bảo hành, Tài liệu điện tử)
-- ============================================================================
CREATE TABLE dbo.Documents (
    id NVARCHAR(50) PRIMARY KEY,
    asset_id NVARCHAR(50) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    file_url NVARCHAR(MAX) NOT NULL,
    file_type NVARCHAR(30) NOT NULL DEFAULT N'invoice' CHECK (file_type IN (N'invoice', N'warranty_card', N'photo', N'manual', N'other')),
    file_size NVARCHAR(50) NULL,
    note NVARCHAR(500) NULL,
    uploaded_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Documents_Assets FOREIGN KEY (asset_id) REFERENCES dbo.Assets(id) ON DELETE CASCADE
);
GO

-- ============================================================================
-- 6. BẢNG REPAIRS (Lịch sử sửa chữa & Chi phí)
-- ============================================================================
CREATE TABLE dbo.Repairs (
    id NVARCHAR(50) PRIMARY KEY,
    asset_id NVARCHAR(50) NOT NULL,
    repair_date DATE NOT NULL,
    repair_center NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    cost DECIMAL(18, 0) NOT NULL DEFAULT 0,
    note NVARCHAR(MAX) NULL,
    technician NVARCHAR(120) NULL,
    warranty_until DATE NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Repairs_Assets FOREIGN KEY (asset_id) REFERENCES dbo.Assets(id) ON DELETE CASCADE
);
GO

-- ============================================================================
-- 7. BẢNG NOTIFICATIONS (Thông báo cảnh báo hạn bảo hành)
-- ============================================================================
CREATE TABLE dbo.Notifications (
    id NVARCHAR(50) PRIMARY KEY,
    user_id NVARCHAR(50) NOT NULL,
    asset_id NVARCHAR(50) NULL,
    asset_name NVARCHAR(255) NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(30) NOT NULL DEFAULT N'system',
    is_read BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Notifications_Assets FOREIGN KEY (asset_id) REFERENCES dbo.Assets(id) ON DELETE NO ACTION
);
GO

-- ============================================================================
-- 8. BẢNG MAINTENANCE (Lịch bảo trì định kỳ)
-- ============================================================================
CREATE TABLE dbo.Maintenance (
    id NVARCHAR(50) PRIMARY KEY,
    asset_id NVARCHAR(50) NOT NULL,
    maintenance_date DATE NOT NULL,
    next_maintenance_date DATE NULL,
    description NVARCHAR(500) NOT NULL,
    cost DECIMAL(18, 0) NOT NULL DEFAULT 0,
    CONSTRAINT FK_Maintenance_Assets FOREIGN KEY (asset_id) REFERENCES dbo.Assets(id) ON DELETE CASCADE
);
GO

-- ============================================================================
-- 9. BẢNG SUPPLIERS (Nhà cung cấp / Nơi mua)
-- ============================================================================
CREATE TABLE dbo.Suppliers (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    address NVARCHAR(350) NULL,
    phone NVARCHAR(50) NULL,
    website NVARCHAR(300) NULL
);
GO

-- ============================================================================
-- 10. BẢNG ACTIVITYLOGS (Nhật ký hoạt động hệ thống)
-- ============================================================================
CREATE TABLE dbo.ActivityLogs (
    id NVARCHAR(50) PRIMARY KEY,
    user_id NVARCHAR(50) NOT NULL,
    user_name NVARCHAR(150) NOT NULL,
    action NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_ActivityLogs_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE CASCADE
);
GO

-- ============================================================================
-- DỮ LIỆU MẪU KHỞI TẠO (SEED DATA)
-- ============================================================================

INSERT INTO dbo.Users (id, full_name, email, password, avatar, role, phone, status, created_at) VALUES
(N'user_1', N'Nguyễn Văn An', N'an.nguyen@example.com', N'123456', N'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80', N'user', N'0912 345 678', N'active', '2026-01-10T08:00:00'),
(N'user_2', N'Trần Thị Mai', N'mai.tran@example.com', N'123456', N'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', N'user', N'0988 765 432', N'active', '2026-02-15T09:30:00'),
(N'user_admin', N'Vũ Đức Hoàng (Quản trị viên)', N'admin@assetcare.vn', N'123456', N'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80', N'admin', N'0909 999 888', N'active', '2025-12-01T00:00:00');

INSERT INTO dbo.Categories (id, name, icon, description, default_warranty_months) VALUES
(N'cat_laptop', N'Laptop & Máy tính', N'Laptop', N'Máy tính xách tay, PC để bàn, màn hình đồ họa', 24),
(N'cat_phone', N'Điện thoại & Tablet', N'Smartphone', N'Điện thoại thông minh, máy tính bảng iPad/Android', 12),
(N'cat_audio', N'Tai nghe & Âm thanh', N'Headphones', N'Tai nghe không dây, loa bluetooth, soundbar', 12),
(N'cat_smartwatch', N'Đồng hồ thông minh', N'Watch', N'Apple Watch, Garmin, Galaxy Watch, vòng đeo tay sức khỏe', 12),
(N'cat_camera', N'Máy ảnh & Ống kính', N'Camera', N'Máy ảnh Mirrorless, DSLR, lens, phụ kiện quay phim', 24),
(N'cat_appliances', N'Gia dụng & Smarthome', N'Home', N'Robot hút bụi, nồi chiên, tivi thông minh, máy lọc không khí', 24),
(N'cat_other', N'Phụ kiện & Khác', N'Cpu', N'Bàn phím cơ, chuột, sạc dự phòng, router WiFi', 12);

INSERT INTO dbo.Assets (id, user_id, category_id, name, brand, model, serial_number, imei, purchase_date, purchase_price, purchase_place, description, status, image_url, created_at, updated_at) VALUES
(N'asset_1', N'user_1', N'cat_laptop', N'Dell XPS 15 9530 (Core i7, 32GB, RTX 4060)', N'Dell', N'XPS 15 9530', N'DLXPS-9530-8821B', NULL, '2026-10-01', 48500000, N'Dell Pro Store - Thái Hà', N'Laptop chuyên dụng làm việc đồ họa và lập trình, gói bảo hành ProSupport tận nơi 24 tháng.', N'active', N'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80', '2026-10-01T10:00:00', '2026-10-01T10:00:00'),
(N'asset_2', N'user_1', N'cat_phone', N'iPhone 16 Pro Max 256GB Titan Tự Nhiên', N'Apple', N'A3296', N'F2LXYZ99P4K1', N'358941098234561', '2025-09-20', 34990000, N'TopZone / Thế Giới Di Động', N'Máy chính hãng VN/A, dán PPF và ốp lưng UAG.', N'active', N'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80', '2025-09-20T14:20:00', '2026-09-05T09:00:00'),
(N'asset_3', N'user_1', N'cat_audio', N'Tai nghe Chống Ồn Sony WH-1000XM5', N'Sony', N'WH-1000XM5 Black', N'SN-WH5-554109', NULL, '2025-11-15', 8490000, N'Sony Center Vincom', N'Tai nghe chống ồn chủ động cao cấp, pin 30 giờ.', N'active', N'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', '2025-11-15T11:00:00', '2025-11-15T11:00:00'),
(N'asset_4', N'user_1', N'cat_appliances', N'Robot Hút Bụi Lau Nhà Dreame L20 Ultra', N'Dreame', N'RLS6LADC', N'DRM-L20-774129', NULL, '2026-01-05', 21990000, N'Dreame Flagship Store', N'Trạm sạc tự giặt sấy giẻ nước nóng, lực hút 7000Pa.', N'active', N'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', '2026-01-05T08:30:00', '2026-07-18T10:00:00'),
(N'asset_5', N'user_1', N'cat_smartwatch', N'Apple Watch Ultra 2 GPS + Cellular 49mm', N'Apple', N'A2986', N'AWU2-887612', N'354112998765432', '2025-12-10', 21490000, N'CellphoneS', N'Dây Alpine Loop màu cam, phục vụ chạy bộ và đo nhịp tim.', N'active', N'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80', '2025-12-10T16:00:00', '2025-12-10T16:00:00'),
(N'asset_6', N'user_1', N'cat_phone', N'iPad Air 5 M1 64GB WiFi', N'Apple', N'A2588', N'DMPY9876QW42', NULL, '2024-06-12', 15490000, N'FPT Shop', N'Máy học tập và đọc sách báo, đã hết bảo hành chính hãng.', N'active', N'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80', '2024-06-12T10:00:00', '2024-06-12T10:00:00'),
(N'asset_7', N'user_1', N'cat_camera', N'Sony Alpha 7 IV (Body) Mirrorless', N'Sony', N'ILCE-7M4', N'SN-A7M4-339812', NULL, '2026-03-01', 56900000, N'VJShop - Nhiếp ảnh chuyên nghiệp', N'Bảo hành chính hãng Sony Việt Nam 24 tháng kèm thẻ hội viên.', N'active', N'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80', '2026-03-01T09:15:00', '2026-03-01T09:15:00'),
(N'asset_8', N'user_1', N'cat_appliances', N'Máy Sấy Tóc Dyson Supersonic HD15', N'Dyson', N'HD15 Special Edition', N'DY-HD15-99881', NULL, '2024-02-14', 12500000, N'Dyson Lotte Mall Tây Hồ', N'Màu xanh Vinca Blue, đã hết bảo hành 2 năm.', N'active', N'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', '2024-02-14T11:00:00', '2024-02-14T11:00:00');

INSERT INTO dbo.Warranties (id, asset_id, provider, start_date, end_date, duration_months, terms, hotline, website, policy_type, created_at) VALUES
(N'war_1', N'asset_1', N'Dell Vietnam / Synnex FPT', '2026-10-01', '2028-10-01', 24, N'Bảo hành Premium Support 24/7, thay linh kiện tại nhà trong vòng 24 giờ.', N'1800 545 455', N'https://www.dell.com/support', N'Bảo hành VIP tại nhà', '2026-10-01T10:00:00'),
(N'war_2', N'asset_2', N'Apple Care / TopZone AASP', '2025-09-20', '2026-11-20', 14, N'Bảo hành 1 đổi 1 lỗi nhà sản xuất, bảo hiểm rơi vỡ màn hình năm 1.', N'1800 1127', N'https://checkcoverage.apple.com', N'Apple Care 1 đổi 1', '2025-09-20T14:20:00'),
(N'war_3', N'asset_3', N'Sony Electronics Vietnam', '2025-11-15', '2026-11-15', 12, N'Bảo hành chính hãng toàn bộ linh kiện âm thanh, pin, driver chống ồn.', N'1800 588 885', N'https://baohanhdientu.sony.com.vn', N'Bảo hành điện tử', '2025-11-15T11:00:00'),
(N'war_4', N'asset_4', N'Dreame Technology Vietnam', '2026-01-05', '2028-01-05', 24, N'Bảo hành động cơ hút 24 tháng, pin và dock sạc 12 tháng.', N'1900 633 825', N'https://dreamevietnam.vn', N'Chính hãng Dreame', '2026-01-05T08:30:00'),
(N'war_5', N'asset_5', N'Apple Authorized Service Provider', '2025-12-10', '2026-12-10', 12, N'Bảo hành phần cứng và chống nước 100m, hỗ trợ thay pin nếu chai dưới 80%.', N'1800 1127', N'https://support.apple.com/watch', N'Chính hãng Apple VN/A', '2025-12-10T16:00:00'),
(N'war_6', N'asset_6', N'FPT Care Services', '2024-06-12', '2025-06-12', 12, N'Hạn bảo hành tiêu chuẩn 1 năm của nhà sản xuất.', N'1800 6601', N'https://fptshop.com.vn/ho-tro/chinh-sach-bao-hanh', N'Bảo hành tiêu chuẩn', '2024-06-12T10:00:00'),
(N'war_7', N'asset_7', N'Sony Electronics Vietnam', '2026-03-01', '2028-03-01', 24, N'Bảo hành cảm biến Full-frame và bo mạch chủ 24 tháng.', N'1800 588 885', N'https://sony.com.vn', N'Sony Alpha Pro Warranty', '2026-03-01T09:15:00'),
(N'war_8', N'asset_8', N'Dyson Vietnam Service', '2024-02-14', '2026-02-14', 24, N'Bảo hành động cơ kỹ thuật số Dyson V9 và cảm biến nhiệt.', N'1800 6388', N'https://dyson.vn', N'Dyson Official Care', '2024-02-14T11:00:00');

INSERT INTO dbo.Documents (id, asset_id, name, file_url, file_type, file_size, note, uploaded_at) VALUES
(N'doc_1', N'asset_1', N'Hoa_don_GTGT_Dell_XPS15.pdf', N'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', N'invoice', N'1.4 MB', N'Hóa đơn điện tử số HD-2026-9921', '2026-10-01T10:05:00'),
(N'doc_2', N'asset_1', N'Phieu_bao_hanh_Dell_ProSupport.pdf', N'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80', N'warranty_card', N'850 KB', N'Chứng nhận bảo hành vàng 2 năm', '2026-10-01T10:08:00'),
(N'doc_3', N'asset_2', N'Hoa_don_Apple_iPhone16ProMax.pdf', N'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', N'invoice', N'1.1 MB', N'Hóa đơn mua tại TopZone', '2025-09-20T14:30:00'),
(N'doc_4', N'asset_3', N'Phieu_bao_hanh_dien_tu_Sony.jpg', N'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80', N'warranty_card', N'620 KB', N'Mã QR kích hoạt bảo hành điện tử', '2025-11-15T11:10:00'),
(N'doc_5', N'asset_4', N'Hoa_don_Dreame_L20_Ultra.pdf', N'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', N'invoice', N'2.0 MB', N'Hóa đơn VAT và sách hướng dẫn sử dụng tiếng Việt', '2026-01-05T08:45:00');

INSERT INTO dbo.Repairs (id, asset_id, repair_date, repair_center, description, cost, note, technician, warranty_until, created_at) VALUES
(N'rep_1', N'asset_2', '2026-09-05', N'CareS - Trung Tâm Bảo Hành Ủy Quyền Apple', N'Thay pin chính hãng Apple, kiểm tra ron chống nước.', 850000, N'Pin cũ chai còn 79%. Sau khi thay pin đạt 100%, được bảo hành pin mới 90 ngày.', N'Lê Minh Quân', '2026-12-05', '2026-09-05T15:30:00'),
(N'rep_2', N'asset_1', '2026-03-12', N'FPT Services Cầu Giấy', N'Vệ sinh quạt tản nhiệt, tra keo gốm tản nhiệt Arctic MX-6.', 200000, N'Nhiệt độ CPU giảm 12 độ C khi tải nặng.', N'Đỗ Tiến Dũng', NULL, '2026-03-12T11:00:00'),
(N'rep_3', N'asset_4', '2026-07-18', N'Dreame Care Service Hub', N'Bảo trì thay cuộn chổi cao su chống rối và bộ lọc bụi kháng khuẩn HEPA.', 650000, N'Thay thế phụ kiện tiêu hao định kỳ 6 tháng một lần.', N'Phạm Văn Nam', '2026-10-18', '2026-07-18T14:00:00');

INSERT INTO dbo.Notifications (id, user_id, asset_id, asset_name, title, message, type, is_read, created_at) VALUES
(N'notif_1', N'user_1', N'asset_3', N'Tai nghe Chống Ồn Sony WH-1000XM5', N'🔴 Khẩn cấp: Sắp hết bảo hành trong 6 ngày!', N'Tai nghe Sony WH-1000XM5 sẽ kết thúc thời hạn bảo hành vào ngày 15/11/2026. Vui lòng kiểm tra kỹ micro chống ồn và pin trước khi hết hạn!', N'danger_7', 0, '2026-11-09T05:00:00'),
(N'notif_2', N'user_1', N'asset_2', N'iPhone 16 Pro Max 256GB', N'🟡 Cảnh báo: Còn 11 ngày bảo hành chính hãng', N'iPhone 16 Pro Max sẽ hết hạn bảo hành vào ngày 20/11/2026. Bạn có thể gia hạn AppleCare+ hoặc kiểm tra tổng thể tại TTBH ủy quyền.', N'warning_30', 0, '2026-11-08T08:00:00'),
(N'notif_3', N'user_1', N'asset_5', N'Apple Watch Ultra 2', N'🟠 Nhắc nhở: Còn 31 ngày bảo hành', N'Thời hạn bảo hành Apple Watch Ultra 2 sắp kết thúc vào ngày 10/12/2026.', N'warning_60', 1, '2026-11-01T09:00:00'),
(N'notif_4', N'user_1', N'asset_6', N'iPad Air 5 M1', N'⚠️ Thiết bị đã hết thời hạn bảo hành', N'iPad Air 5 M1 đã hết hạn bảo hành từ ngày 12/06/2025. Chi phí sửa chữa sau này sẽ áp dụng bảng giá tiêu chuẩn ngoài bảo hành.', N'expired', 1, '2025-06-13T08:00:00'),
(N'notif_5', N'user_1', N'asset_1', N'Dell XPS 15 9530', N'🔧 Nhắc nhở bảo dưỡng & vệ sinh định kỳ', N'Đã 6 tháng kể từ lần vệ sinh tản nhiệt gần nhất của laptop Dell XPS 15. Bạn nên kiểm tra và vệ sinh để duy trì hiệu năng cao.', N'maintenance', 0, '2026-11-05T10:00:00');

INSERT INTO dbo.Suppliers (id, name, address, phone, website) VALUES
(N'sup_1', N'TopZone / Thế Giới Di Động', N'128 Trần Quang Khải, Quận 1, TP.HCM', N'1800 1060', N'https://www.topzone.vn'),
(N'sup_2', N'FPT Shop', N'261 Khánh Hội, Quận 4, TP.HCM', N'1800 6601', N'https://fptshop.com.vn'),
(N'sup_3', N'CellphoneS', N'350 Võ Văn Kiệt, Quận 1, TP.HCM', N'1800 2097', N'https://cellphones.com.vn');

INSERT INTO dbo.Maintenance (id, asset_id, maintenance_date, next_maintenance_date, description, cost) VALUES
(N'mnt_1', N'asset_1', '2026-03-12', '2026-09-12', N'Vệ sinh tản nhiệt & thay keo tản nhiệt định kỳ', 200000);

INSERT INTO dbo.ActivityLogs (id, user_id, user_name, action, description, created_at) VALUES
(N'act_1', N'user_1', N'Nguyễn Văn An', N'Thêm tài sản mới', N'Đăng ký tài sản: Dell XPS 15 9530 trị giá 48.500.000 ₫', '2026-10-01T10:00:00'),
(N'act_2', N'user_1', N'Nguyễn Văn An', N'Upload hóa đơn', N'Đã tải lên tệp: Hoa_don_GTGT_Dell_XPS15.pdf', '2026-10-01T10:05:00'),
(N'act_3', N'user_1', N'Nguyễn Văn An', N'Ghi nhận sửa chữa', N'Thay pin iPhone 16 Pro Max tại CareS, chi phí 850.000 ₫', '2026-09-05T15:30:00'),
(N'act_4', N'user_admin', N'Vũ Đức Hoàng (Admin)', N'Cập nhật danh mục', N'Cập nhật cấu hình bảo hành mặc định cho danh mục Laptop & Máy tính', '2026-08-10T14:00:00');
GO

PRINT N'Khởi tạo CSDL AssetCareDB (10 bảng) và dữ liệu mẫu thành công!';
GO
