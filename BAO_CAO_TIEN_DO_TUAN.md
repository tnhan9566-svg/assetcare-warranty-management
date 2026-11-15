# BÁO CÁO TIẾN ĐỘ THỰC HIỆN ĐỒ ÁN MÔN HỌC (ĐỒ ÁN CƠ SỞ 2)

**Trường:** Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)  
**Kính gửi:** Giảng viên hướng dẫn đồ án  

---

## 1. THÔNG TIN CHUNG
- **Tên đề tài:** XÂY DỰNG ỨNG DỤNG WEB QUẢN LÝ THIẾT BỊ ĐIỆN TỬ VÀ THỜI HẠN BẢO HÀNH
- **Tên sản phẩm ứng dụng:** AssetCare – Personal Asset & Warranty Management System
- **Sinh viên thực hiện:** Lê Trọng Nhân
- **Email:** nhanlt.25gt@vku.udn.vn
- **Thời điểm báo cáo:** Ngày 09/11/2026 (Giai đoạn chuyển tiếp Tuần 4&5 sang Tuần 6&7)

---

## 2. KẾ HOẠCH VÀ TIẾN ĐỘ TỔNG THỂ THEO ĐỀ CƯƠNG
| Giai đoạn | Thời gian | Nội dung công việc | Tình trạng |
| :--- | :--- | :--- | :--- |
| **Tuần 4&5** | 26/10 đến 08/11/2026 | Lập trình CRUD tài sản, danh mục và thông tin mua hàng | **Đã hoàn thành 100%** |
| **Tuần 6&7** | 09/11 đến 22/11/2026 | Lập trình quản lý bảo hành, lịch sửa chữa và thống kê | **Đang triển khai trọng tâm** |
| **Tuần 8** | 23/11 đến 29/11/2026 | Kiểm thử chức năng, sửa lỗi và hoàn thiện giao diện | Dự kiến kế tiếp |
| **Tuần 9&10** | 30/11 đến 13/12/2026 | Viết báo cáo, hoàn thiện ERD, hình ảnh minh họa và kết quả thử nghiệm | Theo kế hoạch |
| **Tuần 11** | 14/12 đến 20/12/2026 | Hoàn thiện slide tiếng Anh, kiểm tra sản phẩm và đóng gói mã nguồn | Theo kế hoạch |

---

## 3. NỘI DUNG VÀ KẾT QUẢ ĐÃ THỰC HIỆN CHI TIẾT

### 3.1. Phân hệ Quản lý Tài sản, Danh mục và Mua hàng (Tuần 4&5 - Hoàn thành 100%):
- **Chức năng CRUD thiết bị:** Xây dựng hoàn chỉnh tính năng Thêm mới, Chỉnh sửa, Xóa và Xem chi tiết từng tài sản.
- **Quản lý dữ liệu mua hàng:** Lưu trữ đầy đủ Tên tài sản, loại thiết bị, thương hiệu, model, số Serial, số IMEI, ngày mua, giá mua (VNĐ), nơi mua và hình ảnh.
- **Quản lý danh mục:** Thiết lập hệ thống phân loại (Laptop, Smartphone & Tablet, Tai nghe & Âm thanh, Smartwatch, Máy ảnh, Gia dụng & Smarthome, Phụ kiện) với thời hạn bảo hành chuẩn mặc định cho từng nhóm.
- **Số hóa hóa đơn & chứng từ:** Tải lên và lưu trữ tập trung hóa đơn VAT điện tử, phiếu bảo hành, ảnh chụp thiết bị (JPG, PNG, PDF).
- **Bộ lọc & Tìm kiếm:** Tích hợp bộ lọc đa chiều (theo danh mục, thương hiệu, tình trạng bảo hành), tìm kiếm tức thì theo từ khóa và chuyển đổi linh hoạt 2 chế độ hiển thị (Lưới thẻ Grid / Bảng dữ liệu Table).

### 3.2. Phân hệ Quản lý Bảo hành, Sửa chữa & Thống kê (Tuần 6&7 - Đang triển khai cốt lõi):
- **Tự động hóa tính toán thời hạn bảo hành:**
  - Giải thuật tự động cộng thời hạn bảo hành (12, 24, 36 tháng...) vào ngày mua để xác định ngày hết hạn.
  - Tự động phân loại 3 trạng thái bảo hành:
    - 🟢 **Còn bảo hành:** Ngày hiện tại < ngày hết hạn và còn > 30 ngày.
    - 🟡 **Sắp hết hạn:** Còn từ 1 đến 30 ngày (cảnh báo người dùng kiểm tra gấp thiết bị).
    - 🔴 **Đã hết hạn:** Ngày hiện tại > ngày hết hạn.
  - Thanh tiến trình trực quan đo tỷ lệ % thời gian bảo hành đã trôi qua và số ngày còn lại.
  - Lưu thông tin hotline TTBH chính hãng (Apple, Dell, Sony, Dyson...), website tra cứu online và điều kiện bảo hành.
- **Quản lý Lịch sử sửa chữa & Bảo trì:**
  - Ghi nhận chi tiết từng lần bảo dưỡng, thay pin, vệ sinh máy, sửa linh kiện kèm chi phí (VNĐ), đơn vị sửa chữa, kỹ thuật viên và hạn bảo hành linh kiện sau sửa.
  - Theo dõi tổng chi phí bảo trì tích lũy của từng thiết bị và toàn hệ thống.
- **Hệ thống Cảnh báo thông minh:**
  - Cơ chế phát cảnh báo phân tầng: 60 ngày (nhắc nhở), 30 ngày (cảnh báo), 7 ngày (khẩn cấp), thông báo đã hết hạn và nhắc bảo dưỡng định kỳ 6 tháng/lần.
- **Dashboard & Báo cáo thống kê:**
  - Bảng chỉ số tổng quan: Tổng tài sản, tổng giá trị tài sản đầu tư, cơ cấu trạng thái bảo hành.
  - Danh sách ưu tiên các thiết bị sắp hết bảo hành kèm số ngày đếm ngược.
  - Biểu đồ chi phí sửa chữa phân bổ theo 12 tháng trong năm.
  - Biểu đồ tỷ lệ phân bổ tài sản theo nhóm danh mục và cơ cấu thương hiệu.
- **Tính năng mở rộng:**
  - Tạo tem nhãn QR Code dán thiết bị có thể in trực tiếp.
  - Xuất bảng tổng hợp kiểm kê tài sản (PDF).

---

## 4. KẾ HOẠCH GIAI ĐOẠN TIẾP THEO (TUẦN 7 & 8)
- Tiếp tục tối ưu thuật toán cảnh báo và rà soát các trường hợp biên của thời hạn bảo hành.
- Tiến hành kiểm thử toàn diện các luồng chức năng cho 2 vai trò: Người dùng cá nhân (User) và Quản trị viên (Admin).
- Tinh chỉnh giao diện đảm bảo tính thẩm mỹ, mượt mà và hoạt động tốt trên thiết bị di động.
- Chuẩn bị hình ảnh chụp màn hình thực tế và cấu trúc dữ liệu để phục vụ viết báo cáo Tuần 9&10.

---

## 5. ĐÁNH GIÁ CHUNG VÀ ĐỀ XUẤT
- **Đánh giá tiến độ:** Dự án đang bám sát đúng kế hoạch 12 tuần đã đăng ký, hoàn thành tốt các mục tiêu kỹ thuật đề ra.
- **Đề xuất:** Sinh viên kính báo cáo Thầy xem xét và cho ý kiến chỉ đạo để hoàn thiện tốt nhất các bước tiếp theo.

*Đà Nẵng, ngày 09 tháng 11 năm 2026*  
**Sinh viên thực hiện**  
**Lê Trọng Nhân**
