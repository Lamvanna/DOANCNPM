# 🚀 Hướng dẫn Git & GitHub Commands cho Na Food

## 📋 Bước 1: Chuẩn bị

### Kiểm tra Git đã cài chưa
```bash
git --version
```

### Cấu hình Git (lần đầu tiên)
```bash
git config --global user.name "Lamvanna"
git config --global user.email "your-email@example.com"
```

### Kiểm tra cấu hình
```bash
git config --list
```

## 📁 Bước 2: Khởi tạo Repository

### Di chuyển vào thư mục dự án
```bash
cd d:\123LVN\CNPMNPT
```

### Khởi tạo Git repository
```bash
git init
```

### Thêm remote repository
```bash
git remote add origin https://github.com/Lamvanna/DOANCNPM.git
```

### Kiểm tra remote
```bash
git remote -v
```

## 📝 Bước 3: Tạo .gitignore

### Tạo file .gitignore
```bash
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo *.log >> .gitignore
echo .DS_Store >> .gitignore
echo Thumbs.db >> .gitignore
echo dist/ >> .gitignore
echo build/ >> .gitignore
echo uploads/ >> .gitignore
echo .vscode/ >> .gitignore
echo .idea/ >> .gitignore
```

### Hoặc tạo .gitignore với nội dung đầy đủ
```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
out/

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Uploads
uploads/
public/uploads/

# Temporary files
tmp/
temp/
EOF
```

## 📤 Bước 4: Commit và Push lần đầu

### Kiểm tra trạng thái
```bash
git status
```

### Thêm tất cả file
```bash
git add .
```

### Kiểm tra file đã được staged
```bash
git status
```

### Commit lần đầu
```bash
git commit -m "🎉 Initial commit: Na Food - Food Delivery System

✨ Features:
- Complete food delivery web application
- User authentication and authorization  
- Product catalog with categories
- Shopping cart functionality
- Order management system
- Admin panel for managing products, orders, and users
- Responsive design for mobile and desktop
- MongoDB Atlas integration
- JWT authentication
- Real-time order tracking

🛠️ Tech Stack:
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Database: MongoDB Atlas
- Authentication: JWT
- Styling: Custom CSS with modern design

📋 Setup Instructions:
- Backend: npm run dev (port 5000)
- Frontend: http-server -p 3000
- Admin Panel: /admin.html
- API Health: /api/health

🔐 Default Accounts:
- Admin: admin@nafood.com / admin123
- Staff: staff@nafood.com / staff123  
- User: user@nafood.com / user123"
```

### Push lên GitHub
```bash
git push -u origin main
```

## 🔐 Bước 5: Xử lý Authentication

### Nếu yêu cầu đăng nhập GitHub
```bash
# Sử dụng username và Personal Access Token
# Username: Lamvanna
# Password: [Personal Access Token từ GitHub]
```

### Tạo Personal Access Token
1. Vào GitHub.com → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Chọn quyền: `repo`, `workflow`, `write:packages`
5. Copy token và sử dụng làm password

### Lưu credentials (tùy chọn)
```bash
git config --global credential.helper store
```

## 🔄 Bước 6: Commands thường dùng

### Kiểm tra trạng thái
```bash
git status
```

### Xem lịch sử commit
```bash
git log --oneline
```

### Thêm file mới
```bash
git add filename.txt
# Hoặc thêm tất cả
git add .
```

### Commit thay đổi
```bash
git commit -m "📝 Update: Mô tả thay đổi"
```

### Push lên GitHub
```bash
git push
```

### Pull từ GitHub
```bash
git pull
```

### Xem branches
```bash
git branch
```

### Tạo branch mới
```bash
git checkout -b feature/new-feature
```

### Chuyển branch
```bash
git checkout main
```

### Merge branch
```bash
git merge feature/new-feature
```

## 📋 Bước 7: Cập nhật code thường xuyên

### Workflow cập nhật code
```bash
# 1. Kiểm tra trạng thái
git status

# 2. Thêm file thay đổi
git add .

# 3. Commit với message rõ ràng
git commit -m "✨ Add new feature: Product detail modal"

# 4. Push lên GitHub
git push
```

### Các loại commit message
```bash
# Tính năng mới
git commit -m "✨ Add: Shopping cart functionality"

# Sửa bug
git commit -m "🐛 Fix: Login authentication issue"

# Cập nhật
git commit -m "📝 Update: Admin dashboard UI"

# Xóa code
git commit -m "🗑️ Remove: Unused CSS files"

# Cải thiện performance
git commit -m "⚡ Improve: Database query optimization"

# Refactor code
git commit -m "♻️ Refactor: User authentication module"

# Thêm documentation
git commit -m "📚 Docs: Add API documentation"

# Cấu hình
git commit -m "🔧 Config: Update environment variables"
```

## 🚨 Bước 8: Xử lý lỗi thường gặp

### Lỗi: Repository not found
```bash
# Kiểm tra remote URL
git remote -v

# Sửa remote URL nếu sai
git remote set-url origin https://github.com/Lamvanna/DOANCNPM.git
```

### Lỗi: Authentication failed
```bash
# Sử dụng Personal Access Token thay vì password
# Hoặc cấu hình SSH key
```

### Lỗi: File quá lớn
```bash
# Thêm vào .gitignore
echo "large-file.zip" >> .gitignore
git rm --cached large-file.zip
git commit -m "🗑️ Remove large file"
```

### Undo commit cuối
```bash
git reset --soft HEAD~1
```

### Xóa file khỏi Git nhưng giữ local
```bash
git rm --cached filename.txt
```

## 🎯 Quick Commands Summary

### Setup lần đầu
```bash
cd d:\123LVN\CNPMNPT
git init
git remote add origin https://github.com/Lamvanna/DOANCNPM.git
git add .
git commit -m "🎉 Initial commit"
git push -u origin main
```

### Cập nhật code hàng ngày
```bash
git add .
git commit -m "📝 Update: Mô tả thay đổi"
git push
```

### Kiểm tra và pull code mới
```bash
git status
git pull
```

## 📞 Hỗ trợ

### Kiểm tra help
```bash
git help
git help commit
git help push
```

### Xem cấu hình Git
```bash
git config --list
```

### Reset về trạng thái clean
```bash
git reset --hard HEAD
git clean -fd
```

## 🎉 Hoàn thành!

Sau khi chạy các lệnh trên, code sẽ có sẵn tại:
**https://github.com/Lamvanna/DOANCNPM**

### Kiểm tra kết quả
1. Mở link GitHub repository
2. Kiểm tra tất cả file đã được upload
3. Xem README.md hiển thị đúng
4. Clone về máy khác để test

**🚀 Chúc mừng! Bạn đã thành công tải code lên GitHub!**
