# 📅 Giả Lập Xếp Lịch Học - PTIT Schedule Simulation System

Ứng dụng web giả lập đăng ký môn học và xếp thời khóa biểu theo thời gian thực dành cho sinh viên Học viện Công nghệ Bưu chính Viễn thông (PTIT).

## 🚀 Tính Năng Nổi Bật

- **Tra cứu & Lọc Môn Học Cực Nhanh**: Lọc theo Khoá (D23, D24, D25), Ngành (CNTT, ATTT, DTVT, MKT...), Tên môn, Thứ, Kíp.
- **Quy tắc Ghép Cặp Lý Thuyết & Thực Hành**:
  - Hỗ trợ đăng ký cả Lý thuyết (LT) và Thực hành (TH) của cùng một môn.
  - Kiểm tra ràng buộc **CÙNG NHÓM**: Nếu đã chọn LT Nhóm 01, các Tổ TH khác Nhóm (Nhóm 02, 03) sẽ tự động vô hiệu hóa với nhãn `Khác nhóm (NX)`.
  - Tự động ghép cặp thông minh giữa Lớp LT và Tổ TH đi kèm.
- **Thời Khóa Biểu Trực Quan**:
  - Tự động sắp xếp các ca học lên lưới thời khóa biểu theo mốc giờ chuẩn.
  - Hiển thị chú thích **Tuần học thực tế (Tuần: 1 2 3... 18)** bên dưới mỗi ca học.
  - Phân màu trực quan: **Trực tiếp (Xanh dương)**, **Thực hành (Cam)**, **Online (Xanh lá)**.
- **Tính Tổng Học Phí Dự Kiến**:
  - Tự động nhân tổng số tín chỉ với đơn giá học phí tùy chỉnh.
- **Xuất & In Lịch Học**:
  - Xuất danh sách thời khóa biểu ra file `.csv` / Excel.
  - Hỗ trợ chế độ In hoặc Lưu PDF giao diện thời khóa biểu.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React.js, Vite, Vanilla CSS design system (Responsive Grid & Dark/Light Mode), FontAwesome 6.
- **Backend**: Node.js, Express.js (MVC Pattern), Mongoose ORM.
- **Database**: MongoDB (`res_subject_db`).

---

## 💻 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Yêu cầu hệ thống
- **Node.js**: v18.0+ 
- **MongoDB**: Đang chạy ở cổng mặc định `mongodb://localhost:27017`

### 2. Cấu hình Backend
```bash
cd backend
npm install
# Tạo file .env dựa trên .env.example
npm start
```
*Backend sẽ chạy ở địa chỉ: `http://localhost:5000`*

### 3. Nạp dữ liệu mẫu Môn học (Seed Data)
```bash
cd backend
node seed.js
```

### 4. Cấu hình Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend sẽ chạy ở địa chỉ: `http://localhost:5173`*

---

## 🔒 Bảo Mật & Biến Môi Trường

Dự án sử dụng `.env` để bảo mật thông tin kết nối database và các cổng API. Vui lòng tham khảo file `.env.example` ở thư mục `backend/` và `frontend/` trước khi chạy.
