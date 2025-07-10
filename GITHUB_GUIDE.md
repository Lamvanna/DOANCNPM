# 📂 GitHub - Tải Lên và Clone Project

## 📋 Cài Đặt Git

### **1. Tải Git cho Windows**
1. Truy cập: https://git-scm.com/download/win
2. Tải **Git for Windows**
3. Cài đặt với các tùy chọn mặc định
4. Kiểm tra cài đặt:
```cmd
git --version
```

### **2. Cấu hình Git lần đầu**
```cmd
# Cấu hình tên và email
git config --global user.name "Tên của bạn"
git config --global user.email "email@example.com"

# Kiểm tra cấu hình
git config --list
```

---

## 🚀 Tải Project Lên GitHub

### **Bước 1: Tạo Repository trên GitHub**
1. Đăng nhập GitHub: https://github.com
2. Click **New repository** (nút xanh)
3. Đặt tên: `na-food` hoặc tên khác
4. Chọn **Public** hoặc **Private**
5. **KHÔNG** tick "Add a README file"
6. Click **Create repository**

### **Bước 2: Mở Command Prompt**
```cmd
# Di chuyển vào thư mục project
cd D:\១២
```

### **Bước 3: Khởi tạo Git repository**
```cmd
# Khởi tạo git
git init

# Thêm tất cả files
git add .

# Commit lần đầu
git commit -m "Initial commit - Na Food project"
```

### **Bước 4: Kết nối với GitHub**
```cmd
# Thay YOUR_USERNAME và YOUR_REPO_NAME
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Ví dụ:
git remote add origin https://github.com/john123/na-food.git
```

### **Bước 5: Push code lên GitHub**
```cmd
# Push lần đầu
git push -u origin main

# Hoặc nếu lỗi, thử:
git push -u origin master
```

**Nhập username và password GitHub khi được yêu cầu**

---

## 📥 Clone Project Từ GitHub

### **Cách 1: Clone về máy khác**
```cmd
# Di chuyển vào thư mục muốn lưu project
cd C:\Projects

# Clone project (thay URL thực tế)
git clone https://github.com/YOUR_USERNAME/na-food.git

# Di chuyển vào thư mục project
cd na-food
```

### **Cách 2: Clone project có sẵn**
```cmd
# Clone project Na Food mẫu
git clone https://github.com/example/na-food.git

# Di chuyển vào thư mục
cd na-food
```

---

## 🔄 Cập Nhật Code

### **Push thay đổi lên GitHub:**
```cmd
# Kiểm tra trạng thái
git status

# Thêm files đã thay đổi
git add .

# Hoặc thêm file cụ thể
git add backend/server.js
git add frontend/index.html

# Commit với message mô tả
git commit -m "Update: Thêm tính năng đăng nhập"

# Push lên GitHub
git push
```

### **Pull thay đổi từ GitHub:**
```cmd
# Lấy code mới nhất từ GitHub
git pull

# Hoặc
git pull origin main
```

---

## 📋 Lệnh Git Cơ Bản

### **Kiểm tra trạng thái:**
```cmd
# Xem files đã thay đổi
git status

# Xem lịch sử commit
git log

# Xem lịch sử ngắn gọn
git log --oneline
```

### **Quản lý files:**
```cmd
# Thêm tất cả files
git add .

# Thêm file cụ thể
git add filename.js

# Bỏ file khỏi staging
git reset filename.js

# Xem sự khác biệt
git diff
```

### **Commit và Push:**
```cmd
# Commit với message
git commit -m "Mô tả thay đổi"

# Push lên GitHub
git push

# Push lần đầu với upstream
git push -u origin main
```

---

## 🌿 Làm Việc Với Branches

### **Tạo và chuyển branch:**
```cmd
# Tạo branch mới
git branch feature-login

# Chuyển sang branch
git checkout feature-login

# Hoặc tạo và chuyển cùng lúc
git checkout -b feature-payment
```

### **Merge branch:**
```cmd
# Chuyển về main
git checkout main

# Merge branch vào main
git merge feature-login

# Push sau khi merge
git push
```

---

## 🔧 Xử Lý Lỗi Thường Gặp

### **Lỗi: Authentication failed**
```cmd
# Sử dụng Personal Access Token thay vì password
# 1. Vào GitHub Settings > Developer settings > Personal access tokens
# 2. Generate new token
# 3. Sử dụng token làm password
```

### **Lỗi: Repository not found**
```cmd
# Kiểm tra URL repository
git remote -v

# Thay đổi URL nếu sai
git remote set-url origin https://github.com/USERNAME/REPO.git
```

### **Lỗi: Merge conflict**
```cmd
# Xem files bị conflict
git status

# Sửa conflict trong file, sau đó:
git add .
git commit -m "Resolve merge conflict"
git push
```

### **Lỗi: Permission denied**
```cmd
# Kiểm tra SSH key hoặc dùng HTTPS
git remote set-url origin https://github.com/USERNAME/REPO.git
```

---

## 📁 Tạo .gitignore

### **Tạo file .gitignore:**
```cmd
# Tạo file .gitignore
echo. > .gitignore
```

### **Nội dung .gitignore cho Na Food:**
```gitignore
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Docker
.dockerignore
```

---

## 🎯 Quick Commands

### **Tải lên GitHub lần đầu:**
```cmd
cd D:\១២
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### **Cập nhật hàng ngày:**
```cmd
git add .
git commit -m "Update: mô tả thay đổi"
git push
```

### **Clone project:**
```cmd
git clone https://github.com/USERNAME/REPO.git
cd REPO
```

### **Lấy code mới nhất:**
```cmd
git pull
```

---

## 📝 Workflow Khuyến Nghị

### **1. Làm việc hàng ngày:**
```cmd
# Sáng: Lấy code mới nhất
git pull

# Làm việc và thay đổi code...

# Tối: Push code lên
git add .
git commit -m "Update: tính năng ABC"
git push
```

### **2. Làm tính năng mới:**
```cmd
# Tạo branch mới
git checkout -b feature-new-function

# Làm việc trên branch...

# Push branch lên GitHub
git push -u origin feature-new-function

# Tạo Pull Request trên GitHub
# Merge sau khi review
```

---

## 📞 Hỗ Trợ

**Nếu gặp vấn đề:**
1. Kiểm tra Git đã cài đặt: `git --version`
2. Kiểm tra cấu hình: `git config --list`
3. Kiểm tra remote URL: `git remote -v`
4. Sử dụng Personal Access Token thay vì password
5. Đọc error message để hiểu lỗi

**Chúc bạn thành công với Git và GitHub! 🚀**
