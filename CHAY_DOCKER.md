# 🐳 Chạy Docker - Windows

## 📋 Cài Đặt Docker

### **1. Tải Docker Desktop**
1. Truy cập: https://www.docker.com/products/docker-desktop
2. Click **Download for Windows**
3. Chạy file `.exe` và cài đặt
4. **Restart máy tính** sau khi cài đặt

### **2. Khởi động Docker Desktop**
1. Mở **Docker Desktop** từ Start Menu
2. **Đợi khởi động hoàn tất** (2-3 phút)
3. Icon Docker ở system tray không còn loading
4. Hiển thị "Engine running"

### **3. Kiểm tra Docker**
```cmd
# Mở Command Prompt
docker --version
docker-compose --version
docker ps
```

**Kết quả mong đợi:**
```
Docker version 24.0.x
Docker Compose version v2.x.x
CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES
```

---

## 🚀 Chạy Na Food với Docker

### **Bước 1: Mở Command Prompt**
```cmd
# Nhấn Win + R, gõ "cmd", Enter
```

### **Bước 2: Di chuyển vào thư mục project**
```cmd
cd D:\១២
```

### **Bước 3: Kiểm tra Docker đang chạy**
```cmd
docker ps
```

**⚠️ Nếu lỗi**: Mở Docker Desktop và đợi khởi động hoàn tất

### **Bước 4: Chạy ứng dụng**
```cmd
docker-compose -f docker-compose.dev.yml -p nafood up -d
```

**Kết quả mong đợi:**
```
Creating network "nafood_default" with the default driver
Creating nafood-redis-1    ... done
Creating nafood-backend-1  ... done
Creating nafood-frontend-1 ... done
```

### **Bước 5: Kiểm tra containers đang chạy**
```cmd
docker ps
```

**Sẽ thấy 3 containers:**
- `nafood-backend-1` (API Server)
- `nafood-frontend-1` (Web Server)  
- `nafood-redis-1` (Cache)

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

## 🔧 Quản Lý Docker

### **Xem containers đang chạy:**
```cmd
docker ps
```

### **Xem logs:**
```cmd
# Xem tất cả logs
docker-compose -f docker-compose.dev.yml -p nafood logs

# Xem logs realtime
docker-compose -f docker-compose.dev.yml -p nafood logs -f

# Xem logs backend
docker-compose -f docker-compose.dev.yml -p nafood logs backend

# Xem logs frontend
docker-compose -f docker-compose.dev.yml -p nafood logs frontend
```

### **Dừng ứng dụng:**
```cmd
docker-compose -f docker-compose.dev.yml -p nafood down
```

### **Restart ứng dụng:**
```cmd
# Restart tất cả
docker-compose -f docker-compose.dev.yml -p nafood restart

# Restart service cụ thể
docker-compose -f docker-compose.dev.yml -p nafood restart backend
docker-compose -f docker-compose.dev.yml -p nafood restart frontend
```

### **Rebuild và chạy lại:**
```cmd
# Rebuild tất cả
docker-compose -f docker-compose.dev.yml -p nafood up -d --build

# Rebuild service cụ thể
docker-compose -f docker-compose.dev.yml -p nafood build backend
docker-compose -f docker-compose.dev.yml -p nafood up -d
```

---

## ❌ Xử Lý Lỗi

### **Lỗi: Docker không chạy**
```cmd
# Giải pháp:
1. Mở Docker Desktop
2. Đợi khởi động hoàn tất (2-3 phút)
3. Thử lại: docker ps
```

### **Lỗi: Port đã được sử dụng**
```cmd
# Tìm process đang dùng port
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill process (thay <PID>)
taskkill /PID <PID> /F

# Hoặc dừng Docker containers
docker-compose -f docker-compose.dev.yml -p nafood down
```

### **Lỗi: "project name must not be empty"**
```cmd
# Luôn thêm -p nafood
docker-compose -f docker-compose.dev.yml -p nafood up -d
```

### **Lỗi: Build failed**
```cmd
# Clean up và rebuild
docker system prune -a
docker-compose -f docker-compose.dev.yml -p nafood build --no-cache
docker-compose -f docker-compose.dev.yml -p nafood up -d
```

### **Lỗi: Out of disk space**
```cmd
# Dọn dẹp Docker
docker system prune -a

# Xóa unused volumes
docker volume prune

# Xóa unused images
docker image prune -a
```

---

## 🎯 Quick Commands

### **Chạy hàng ngày:**
```cmd
cd D:\១២
docker-compose -f docker-compose.dev.yml -p nafood up -d
```

### **Kiểm tra nhanh:**
```cmd
docker ps
curl http://localhost:5000/health
```

### **Dừng nhanh:**
```cmd
docker-compose -f docker-compose.dev.yml -p nafood down
```

### **Debug nhanh:**
```cmd
docker-compose -f docker-compose.dev.yml -p nafood logs -f
```

### **Restart nhanh:**
```cmd
docker-compose -f docker-compose.dev.yml -p nafood restart
```

---

## 📊 Monitoring

### **Xem resource usage:**
```cmd
# CPU, Memory usage
docker stats

# Disk usage
docker system df
```

### **Vào shell của container:**
```cmd
# Vào backend container
docker-compose -f docker-compose.dev.yml -p nafood exec backend sh

# Chạy lệnh trong container
docker-compose -f docker-compose.dev.yml -p nafood exec backend npm run seed
```

---

## 🔄 Maintenance

### **Update containers:**
```cmd
# Pull latest images
docker-compose -f docker-compose.dev.yml -p nafood pull

# Rebuild và restart
docker-compose -f docker-compose.dev.yml -p nafood up -d --build
```

### **Clean up:**
```cmd
# Dọn dẹp tất cả
docker system prune -a

# Chỉ dọn dẹp containers đã dừng
docker container prune

# Chỉ dọn dẹp images không dùng
docker image prune
```

---

## 📝 Ghi Chú Quan Trọng

1. **Docker Desktop phải luôn chạy** khi sử dụng
2. **Chờ khởi động hoàn tất** trước khi chạy lệnh
3. **Luôn dùng project name** `-p nafood`
4. **3 containers** sẽ chạy: backend, frontend, redis
5. **Dữ liệu được lưu** trong Docker volumes

---

## 📞 Hỗ Trợ

**Nếu gặp vấn đề:**
1. Kiểm tra Docker Desktop đang chạy
2. Restart Docker Desktop nếu cần
3. Kiểm tra ports không bị conflict
4. Xem logs để debug: `docker-compose logs`
5. Clean up và rebuild nếu cần thiết

**Docker giúp chạy ứng dụng dễ dàng và ổn định! 🐳**
