# 🍽️ Na Food - Website Bán Đồ Ăn Trực Tuyến

**Hệ thống đặt món ăn trực tuyến hiện đại với giao diện thân thiện và quản lý toàn diện**

## 📋 Tổng Quan

Na Food là website bán đồ ăn trực tuyến được xây dựng với:
- 🎨 **Frontend**: HTML, CSS, JavaScript thuần (Vanilla JS)
- ⚡ **Backend**: Node.js + Express.js + MongoDB Atlas
- 🔐 **Authentication**: JWT với phân quyền User/Staff/Admin
- 🐳 **Deployment**: Docker + Docker Compose

## 🚀 Chạy Dự Án

### **Cách 1: Docker (Khuyến nghị)**
```bash
# Clone project
git clone <repository-url>
cd na-food

# Chạy development
docker-compose -f docker-compose.dev.yml -p nafood up -d

# Truy cập: http://localhost:3000
```

### **Cách 2: Local Development**
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (terminal mới)
cd frontend
python -m http.server 3000
```

## 🌐 Truy Cập Ứng Dụng

| Service | URL | Credentials |
|---------|-----|-------------|
| **Website chính** | http://localhost:3000 | - |
| **Admin Panel** | http://localhost:3000/admin.html | admin@nafood.com / admin123 |
| **API Backend** | http://localhost:5000 | - |
| **Database** | MongoDB Atlas | Cloud Database |

## ✨ Tính Năng Chính

### 👥 **Khách Hàng**
- 🛒 Duyệt và đặt món ăn
- 👤 Đăng ký/đăng nhập tài khoản
- 📱 Responsive design (mobile-friendly)
- ⭐ Đánh giá và review sản phẩm
- 📋 Theo dõi đơn hàng

### 🔧 **Admin Panel**
- 📊 Dashboard với thống kê
- 🍕 Quản lý sản phẩm (CRUD)
- 📦 Quản lý đơn hàng
- 👥 Quản lý người dùng
- ⭐ Quản lý đánh giá
- 🎨 Quản lý banner

## 🌐 Truy Cập Ứng Dụng

| Service | URL | Credentials |
|---------|-----|-------------|
| **Website chính** | http://localhost:3000 | - |
| **Admin Panel** | http://localhost:3000/admin.html | admin@nafood.com / admin123 |
| **API Backend** | http://localhost:5000 | - |
| **Database** | MongoDB Atlas | Cloud Database |

## 🛠️ Công Nghệ

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **Deployment**: Docker, Docker Compose

## 📖 Hướng Dẫn

- 🚀 **[RUN_SERVER_GUIDE.md](RUN_SERVER_GUIDE.md)** - Hướng dẫn chạy server từng bước
- 🔧 **[GIT_GUIDE.md](GIT_GUIDE.md)** - Hướng dẫn Git và GitHub

## 📄 License

Dự án này được phân phối dưới giấy phép MIT.

---

<div align="center">

**Made with ❤️ by Na Food Team**

</div>
