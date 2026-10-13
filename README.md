# HỆ THỐNG QUẢN LÝ CÂU LẠC BỘ BIDA CHUYÊN NGHIỆP: THANH LONG BILLIARDS

Dự án phần mềm quản lý vận hành thực tế dành riêng cho câu lạc bộ bida **THANH LONG BILLIARDS**.

---

## 🎱 Tổng Quan Hệ Thống

Hệ thống được thiết kế theo chuẩn nhận diện thương hiệu cao cấp:
- **Tone màu chủ đạo**: Nền đen than chì (`#080a0e`, `#121620`), Xanh lá nỉ bàn bida (`#10b981`, `#059669`), Điểm nhấn Vàng hoàng gia (`#f59e0b`).
- **Typography**: Outfit & Plus Jakarta Sans.
- **Biểu tượng thương hiệu**: Biểu tượng quả bida số 8 phong thủy, quyền lực.
- **Tương thích**: Máy tính để bàn POS, iPad / Tablet và điện thoại di động.

---

## 🚀 Hướng Dẫn Khởi Chạy Website

Server phát triển đã được khởi chạy sẵn tại:
```bash
http://localhost:5173/
```
(Hoặc xem qua mạng nội bộ: `http://192.168.1.8:5173/` trên iPad / Điện thoại cùng mạng Wi-Fi)

Để chạy lại server bất kỳ lúc nào:
```powershell
npm run dev
```

Để build bản đóng gói sản phẩm hoàn thiện:
```powershell
npm run build
```

---

## 🌟 14 Phân Hệ Chức Năng Đã Hoàn Thiện

### 1. Dashboard (Trang Tổng Quan)
- Doanh thu hôm nay (Thực thu từ hóa đơn đã chốt).
- Doanh thu tiền giờ chơi vs Doanh thu đồ ăn, nước uống (F&B).
- Doanh thu tạm tính thời gian thực đang chạy trên các bàn.
- Chi phí vận hành trong ngày & Lợi nhuận ước tính (Gross Profit).
- Số lượng bàn: Đang chơi (Đỏ), Bàn trống (Xanh lá), Chờ thanh toán (Vàng), Bảo trì (Xám).
- Biểu đồ doanh thu theo giờ (08:00 - 23:30) với cột Vàng đánh dấu khung giờ cao điểm.
- Danh sách giao dịch & hóa đơn gần đây với nút xem và in lại bill.

### 2. Sơ Đồ Bàn Bida Trực Quan (Table Map)
- 16 Bàn thực tế: Bàn Lỗ Aileex (8 bàn), Carom 3 Băng Hollywood/Gabriels (4 bàn), Phòng VIP Hoàng Gia (2 phòng), Snooker thi đấu (2 bàn).
- Thẻ bàn thiết kế mô phỏng mặt nỉ bida thực tế với túi lỗ và viền gỗ sang trọng.
- Đồng hồ đếm thời gian chơi trực tiếp theo từng giây (`00:00:00`).
- Tự động tính tiền giờ tạm tính theo công thức cấu hình và làm tròn thời gian.
- **Không bao giờ mất dữ liệu hoặc reset giờ khi F5 / tải lại trang** nhờ LocalStorage reactive engine.
- Thao tác tại bàn:
  - **Mở bàn**: Gán khách hội viên, chọn nhân viên phục vụ, chốt giá giờ.
  - **Tạm dừng / Tiếp tục**: Ghi nhận khoảng thời gian tạm dừng và tự động trừ khỏi tổng thời gian tính tiền.
  - **Chuyển bàn**: Chuyển toàn bộ thời gian chơi và danh sách món order sang bàn đích.
  - **Order món**: Thêm đồ ăn thức uống trực tiếp vào bàn.
  - **Bảo trì**: Đổi trạng thái bảo trì thay nỉ, sửa cơ.
  - **Thanh toán & Trả bàn**: Mở màn hình thu ngân và chuyển bàn về trạng thái Trống.

### 3. Cấu Hình Giá Bàn & Giờ Cao Điểm
- Cấu hình đơn giá riêng biệt cho từng loại bàn (Bàn Lỗ, Carom, VIP, Snooker).
- Cấu hình giờ cao điểm (mặc định: 18:00 - 23:30).
- Cấu hình phụ thu cuối tuần (Thứ 7 & Chủ Nhật).
- Cấu hình làm tròn thời gian: 1 phút, 5 phút, 10 phút, 15 phút.
- Khóa biểu giá theo lượt chơi: Giá áp dụng lúc mở bàn được lưu cố định cho phiên đó, đảm bảo sửa giá hệ thống không làm sai hóa đơn cũ.

### 4. Menu & Order Đồ Ăn, Thức Uống (F&B)
- Danh mục đa dạng: Bia (Heineken, Tiger...), Nước ngọt (Bò Húc, Sting...), Nước suối (Aquafina), Cà phê pha phin, Món ăn vặt (Bò khô cháy tỏi, Đậu phộng...), Đồ ăn nhanh (Mì xào bò trứng...).
- Bộ lọc danh mục nhanh và thanh tìm kiếm tức thời.
- Theo dõi tồn kho thực tế, giá vốn nhập hàng, giá bán và lợi nhuận gộp từng món.
- Thêm món vào bàn kèm ghi chú đặc biệt (ít đá, không đường, chín giòn...).
- Tự động trừ kho ngay khi món được order và hoàn kho nếu hủy món.

### 5. Quầy Thu Ngân & Xuất Hóa Đơn (POS)
- Màn hình thu ngân trực quan phân tách tiền giờ, tiền món, giảm giá hội viên, phụ thu.
- Tích hợp **Mã VietQR chuẩn ngân hàng**: Tự động sinh mã QR chuyển khoản với Ngân hàng MB / Vietcombank, STK, Tên chủ tài khoản và số tiền chính xác từng đồng. Khách chỉ cần quét là thanh toán được ngay.
- Máy tính tiền mặt thông minh: Phím tắt chọn nhanh tiền khách đưa (+50k, +100k, +200k, 500k, Đủ tiền), tự động tính tiền thối lại khách.
- Thanh toán bằng ví trả trước của hội viên VIP (tự động kiểm tra số dư và trừ ví).
- Mẫu in hóa đơn nhiệt tiêu chuẩn POS 80mm có hỗ trợ tiếng Việt có dấu, thông tin quán, wifi, mã hóa đơn và mã QR chuyển khoản.

### 6. Quản Lý Hội Viên & CRM
- Phân hạng thẻ 4 cấp bậc: Tiêu Chuẩn (STANDARD), Bạc (SILVER - giảm 5% tiền giờ), Vàng (GOLD - giảm 10% tiền giờ), Kim Cương (DIAMOND - giảm 15% tiền giờ).
- Tích điểm tự động (1.000đ = 1 điểm).
- Quản lý Ví Trả Trước (Prepaid Wallet) kèm các gói nạp khuyến mãi tặng thêm tiền (ví dụ nạp 1.000.000đ tặng 150.000đ, nạp 5.000.000đ tặng 1.200.000đ).
- Lưu trữ lịch sử chơi và tổng chi tiêu của từng cơ thủ.

### 7. Quản Lý Nhân Viên & Ca Làm Việc
- Phân quyền 4 vai trò: **Chủ Quán**, **Quản Lý**, **Thu Ngân**, **Phục Vụ**.
- Giao ca & Đóng ca: Nhập tiền mặt đầu ca (tiền thối lẻ), ghi nhận doanh thu trong ca, đếm tiền mặt thực tế cuối ca và tự động tính toán chênh lệch tiền mặt thừa/thiếu.
- Nhật ký thao tác nhạy cảm (Audit Log): Ghi nhận người thực hiện, thời gian và chi tiết các hành động như mở bàn, đổi giá, giảm giá, chuyển bàn, lập phiếu thu chi.

### 8. Kho Hàng & Sổ Quỹ Thu - Chi
- Quản lý định mức tồn kho tối thiểu với cảnh báo hàng sắp hết.
- Nhập hàng vào kho kèm ghi nhận công nợ / nhà cung cấp và tự động tạo phiếu chi.
- Sổ quỹ Thu - Chi tiền mặt: Ghi chép chi phí điện, nước, internet, lương nhân viên, bảo trì thay nỉ.
- Báo cáo dòng tiền ròng (Net Cashflow).

### 9. Báo Cáo Kinh Doanh & Xuất File CSV
- Bộ lọc thời gian: Hôm nay, 7 ngày qua, Tháng này, Toàn bộ.
- Bảng xếp hạng doanh thu và số giờ chơi của từng bàn bida.
- Thống kê năng suất và doanh thu theo nhân viên.
- **Xuất báo cáo ra định dạng CSV (Excel)** hỗ trợ tiếng Việt có dấu với 1 cú nhấp chuột.

### 10. Cài Đặt & Đồng Bộ Supabase Cloud
- Tùy chỉnh tên quán, slogan, hotline, địa chỉ, mật khẩu wifi.
- Tùy chỉnh tài khoản ngân hàng thụ hưởng VietQR.
- Cấu hình kết nối đám mây **Supabase Cloud (PostgreSQL)** để đồng bộ nhiều thiết bị.
- Cơ chế **Sao lưu dữ liệu (Backup JSON)** và **Khôi phục dữ liệu (Restore JSON)**.
- Nút đặt lại dữ liệu mẫu (Reset demo).

---

## 🗄️ Cấu Trúc Database Supabase (Tùy Chọn Kích Hoạt Cloud)

Nếu quý khách muốn kết nối với cơ sở dữ liệu đám mây Supabase, có thể chạy đoạn SQL sau trong Supabase SQL Editor:

\`\`\`sql
-- Bảng bàn bida
CREATE TABLE tables (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  area TEXT NOT NULL,
  current_session_id TEXT,
  assigned_staff_name TEXT,
  notes TEXT
);

-- Bảng phiên chơi
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  table_id TEXT NOT NULL REFERENCES tables(id),
  table_code TEXT NOT NULL,
  table_type TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT NOT NULL,
  applied_hourly_rate NUMERIC NOT NULL,
  pause_records JSONB DEFAULT '[]',
  customer_id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_tier TEXT,
  staff_id TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  orders JSONB DEFAULT '[]',
  played_minutes NUMERIC,
  table_fee NUMERIC,
  orders_fee NUMERIC,
  discount_amount NUMERIC DEFAULT 0,
  surcharge NUMERIC DEFAULT 0,
  final_total NUMERIC,
  payment_method TEXT,
  payment_details JSONB,
  cashier_name TEXT,
  completed_at TIMESTAMPTZ
);

-- Bảng menu F&B
CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  cost_price NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  min_stock_alert INT NOT NULL DEFAULT 10,
  is_available BOOLEAN DEFAULT TRUE
);

-- Bảng hội viên
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL DEFAULT 'STANDARD',
  points INT DEFAULT 0,
  prepaid_balance NUMERIC DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  total_play_hours NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);
\`\`\`
