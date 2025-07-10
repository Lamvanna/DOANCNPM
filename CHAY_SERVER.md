# 🖥️ Chạy Server Node.js - Windows

## 📋 Cài Đặt Môi Trường

### **1. Cài đặt Node.js**
1. Truy cập: https://nodejs.org/
2. Tải **LTS version** (khuyến nghị)
3. Chạy file `.msi` và cài đặt
4. Mở **Command Prompt** và kiểm tra:
```cmd
node --version
npm --version
```

---

## 🚀 Chạy Backend

### **Bước 1: Mở Command Prompt**
```cmd
# Nhấn Win + R, gõ "cmd", Enter
```

### **Bước 2: Di chuyển vào thư mục backend**
```cmd
cd D:\១២\backend
```

### **Bước 3: Cài đặt packages**
```cmd
npm install
```

### **Bước 4: Setup database và tạo dữ liệu mẫu**
```cmd
npm run setup
```

**Kết quả mong đợi:**
```
🌱 Starting to seed database...
✅ Users seeded successfully
✅ Products seeded successfully  
✅ Banners seeded successfully
🎉 Database seeded successfully!

📋 Default accounts created:
   Admin: admin@nafood.com / admin123
   Staff: staff@nafood.com / staff123
   User:  user@nafood.com / user123
```

### **Bước 5: Chạy backend server**
```cmd
npm run dev
```

**Kết quả mong đợi:**
```
🚀 Server is running on port 5000
📡 Connected to MongoDB Atlas
🌐 CORS enabled for: http://localhost:3000
```

**⚠️ Giữ terminal này mở - đừng đóng!**

---

## 🌐 Chạy Frontend

### **Bước 1: Mở Command Prompt mới**
```cmd
# Nhấn Win + R, gõ "cmd", Enter (terminal mới)
```

### **Bước 2: Di chuyển vào thư mục frontend**
```cmd
cd D:\១២\frontend
```

**⚠️ QUAN TRỌNG: Phải vào đúng thư mục `frontend`, không phải thư mục gốc!**

### **Bước 3: Kiểm tra đã vào đúng thư mục**
```cmd
# Kiểm tra có file index.html không
dir index.html

# Kết quả phải hiển thị file index.html
```

### **Bước 4: Chạy frontend server**
```cmd
# Cách 1: Node.js http-server (Khuyến nghị)
npx http-server . -p 3000

# Cách 2: Python (nếu có cài)
python -m http.server 3000
```

**Kết quả mong đợi:**
```
Starting up http-server, serving .
Available on:
  http://127.0.0.1:3000
  http://192.168.1.100:3000
```

**⚠️ Giữ terminal này mở - đừng đóng!**

---

## 🌐 Truy Cập Website

### **Mở trình duyệt và truy cập:**
- **Website chính**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin.html
- **API Health**: http://localhost:5000/health

### **Hoặc mở nhanh bằng lệnh:**
```cmd
start http://localhost:3000
start http://localhost:3000/admin.html
```

---

## 🔐 Tài Khoản Đăng Nhập

```
👑 Admin:  admin@nafood.com  / admin123
👨‍💼 Staff:  staff@nafood.com  / staff123
👤 User:   user@nafood.com   / user123
```

---

## 🔧 Lệnh Hữu Ích

### **Backend Commands:**
```cmd
cd D:\១២\backend

# Chạy development (auto-restart khi code thay đổi)
npm run dev

# Chạy production
npm start

# Tạo lại dữ liệu mẫu
npm run seed

# Setup lại từ đầu
npm run setup
```

### **Frontend Commands:**
```cmd
cd D:\១២\frontend

# Chạy với Node.js
npx http-server . -p 3000

# Chạy với Python
python -m http.server 3000

# Chạy port khác (nếu 3000 bị chiếm)
npx http-server . -p 3001
```

---

## ❌ Xử Lý Lỗi

### **Lỗi: Hiển thị "Index of /" thay vì website**
```cmd
# Nguyên nhân: Đang chạy server từ thư mục sai
# Giải pháp:
1. Dừng server hiện tại: Ctrl+C
2. Vào đúng thư mục: cd D:\១២\frontend
3. Kiểm tra: dir index.html
4. Chạy lại: npx http-server . -p 3000
```

### **Lỗi: Port đã được sử dụng**
```cmd
# Tìm process đang dùng port
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill process (thay <PID> bằng số thực tế)
taskkill /PID <PID> /F

# Hoặc dùng port khác
npx http-server . -p 3001
```

### **Lỗi: npm install failed**
```cmd
cd D:\១២\backend

# Xóa và cài lại
rmdir /s node_modules
del package-lock.json
npm install
```

### **Lỗi: MongoDB connection**
```cmd
# Kiểm tra internet connection
ping google.com

# MongoDB Atlas đã được cấu hình sẵn
# Nếu vẫn lỗi, kiểm tra file .env
type .env
```

### **Lỗi: Cannot find module**
```cmd
# Cài lại dependencies
cd D:\១២\backend
npm install

# Hoặc cài package cụ thể
npm install express mongoose
```

---

## 🎯 Quick Commands

### **Chạy hàng ngày:**
```cmd
# Terminal 1 - Backend
cd D:\១២\backend
npm run dev

# Terminal 2 - Frontend  
cd D:\១២\frontend
npx http-server . -p 3000
```

### **Dừng servers:**
```cmd
# Nhấn Ctrl+C trong mỗi terminal
```

### **Restart nhanh:**
```cmd
# Trong terminal backend: Ctrl+C rồi
npm run dev

# Trong terminal frontend: Ctrl+C rồi
npx http-server . -p 3000
```

---

## 📊 Kiểm Tra Hoạt Động

### **Test Backend API:**
```cmd
# Test health check
curl http://localhost:5000/health

# Hoặc mở browser: http://localhost:5000/health
```

### **Test Frontend:**
```cmd
# Mở browser: http://localhost:3000
```

### **Test Admin Login:**
1. Vào: http://localhost:3000/admin.html
2. Đăng nhập: admin@nafood.com / admin123

---

## 📝 Ghi Chú Quan Trọng

1. **Luôn chạy 2 terminals**: 1 cho backend, 1 cho frontend
2. **Đừng đóng terminals** khi đang sử dụng website
3. **Backend chạy port 5000**, Frontend chạy port 3000
4. **MongoDB** đã được cấu hình sẵn (Atlas Cloud)
5. **Dữ liệu mẫu** được tạo tự động khi chạy `npm run setup`
6. **⚠️ QUAN TRỌNG**: Frontend server phải chạy từ thư mục `D:\១២\frontend`, không phải thư mục gốc
7. **Nếu thấy "Index of /"**: Có nghĩa đang chạy từ thư mục sai

---

## 📞 Hỗ Trợ

**Nếu gặp vấn đề:**
1. Kiểm tra Node.js đã cài đặt: `node --version`
2. Kiểm tra internet connection
3. Đảm bảo 2 terminals đều đang chạy
4. Restart terminals nếu cần
5. Kiểm tra ports không bị conflict

**Chúc bạn thành công! 🚀**
