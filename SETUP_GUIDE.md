# 🚀 Hướng dẫn cài đặt và chạy Na Food

## 📋 Yêu cầu hệ thống

- **Node.js** v14.0.0 trở lên
- **npm** v6.0.0 trở lên
- **MongoDB Atlas** account (đã có sẵn)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🔧 Cài đặt và chạy Backend

### 1. Di chuyển vào thư mục backend
```bash
cd backend
```

### 2. Cài đặt dependencies (nếu chưa cài)
```bash
npm install
```

### 3. Chạy server

#### Development mode (khuyến nghị - tự restart khi có thay đổi):
```bash
npm run dev
```

#### Production mode:
```bash
npm start
```

### 4. Kiểm tra Backend
- **Server URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Log hiển thị**: `Server running in development mode on port 5000`

## 🌐 Cài đặt và chạy Frontend

### 1. Di chuyển vào thư mục frontend
```bash
cd frontend
```

### 2. Cài đặt http-server (nếu chưa có)
```bash
npm install -g http-server
```

### 3. Chạy frontend server
```bash
http-server -p 3000 -c-1
```

### 4. Truy cập ứng dụng
- **Trang chủ**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin.html
- **Simple Admin**: http://localhost:3000/admin-simple.html

## ⚡ Chạy cả 2 server cùng lúc

### Cách 1: Sử dụng 2 Terminal
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
http-server -p 3000 -c-1
```

### Cách 2: Sử dụng concurrently (nếu đã cài)
```bash
# Từ thư mục root
npm run dev
```

## 🔐 Tài khoản test

### Admin
- **Email**: admin@nafood.com
- **Password**: admin123

### Staff
- **Email**: staff@nafood.com  
- **Password**: staff123

### User
- **Email**: user@nafood.com
- **Password**: user123

## 🌐 URLs quan trọng

### Frontend
- 🏠 **Trang chủ**: http://localhost:3000
- 👑 **Admin Panel**: http://localhost:3000/admin.html
- 🔑 **Simple Admin**: http://localhost:3000/admin-simple.html
- 🧪 **Test Page**: http://localhost:3000/test-admin-simple.html

### Backend API
- 🔗 **Base URL**: http://localhost:5000/api
- ❤️ **Health Check**: http://localhost:5000/api/health
- 📦 **Products**: http://localhost:5000/api/products
- 👥 **Users**: http://localhost:5000/api/users
- 📋 **Orders**: http://localhost:5000/api/orders

## 🐛 Troubleshooting

### Backend không chạy được
```bash
# Kiểm tra port 5000 có bị chiếm không
netstat -an | findstr :5000

# Thay đổi port (trong file .env)
PORT=5001
```

### Frontend không chạy được
```bash
# Thử port khác
http-server -p 8080 -c-1

# Hoặc sử dụng live-server
npm install -g live-server
live-server --port=3000
```

### Không kết nối được MongoDB
- Kiểm tra file `.env` có đúng connection string không
- Kiểm tra IP whitelist trên MongoDB Atlas
- Kiểm tra internet connection

## 📝 Scripts có sẵn

### Backend (package.json)
```bash
npm start      # Production server
npm run dev    # Development server với nodemon
npm test       # Run tests
```

### Frontend
```bash
http-server -p 3000 -c-1    # Static server
live-server --port=3000     # Alternative với live reload
```

## 🎯 Quick Start (Khởi động nhanh)

```bash
# 1. Backend (Terminal 1)
cd backend
npm install
npm run dev

# 2. Frontend (Terminal 2)
cd frontend  
http-server -p 3000 -c-1

# 3. Truy cập
# Frontend: http://localhost:3000
# Admin: http://localhost:3000/admin.html
# API: http://localhost:5000
```

## 📊 Kiểm tra trạng thái

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

### Frontend Check
```bash
curl http://localhost:3000
```

## 🔍 Test các chức năng

### 1. Test Backend API
```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nafood.com","password":"admin123"}'

# Test products
curl http://localhost:5000/api/products
```

### 2. Test Frontend
1. Mở http://localhost:3000
2. Đăng ký/đăng nhập tài khoản
3. Thêm sản phẩm vào giỏ hàng
4. Thực hiện thanh toán

### 3. Test Admin Panel
1. Mở http://localhost:3000/admin.html
2. Đăng nhập với admin@nafood.com / admin123
3. Kiểm tra dashboard, quản lý sản phẩm, đơn hàng

## 🚨 Lưu ý quan trọng

1. **Đảm bảo cả Backend và Frontend đều chạy** trước khi test
2. **Backend phải chạy trước Frontend** để API hoạt động
3. **Kiểm tra console browser** nếu có lỗi JavaScript
4. **Kiểm tra terminal backend** nếu có lỗi API
5. **MongoDB Atlas phải có kết nối internet** để hoạt động

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trong terminal
2. Mở Developer Tools (F12) trong browser
3. Kiểm tra Network tab để xem API calls
4. Đảm bảo tất cả dependencies đã được cài đặt

**🎉 Chúc bạn thành công với Na Food!**
