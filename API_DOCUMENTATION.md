# 📚 Na Food API Documentation

## 🔗 Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication

Hệ thống sử dụng JWT (JSON Web Token) để xác thực. Token được gửi trong header:
```
Authorization: Bearer <token>
```

## 📋 API Endpoints

### 🔑 Authentication

#### Đăng ký
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "password123",
  "phone": "0123456789"
}
```

#### Đăng nhập
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Lấy thông tin user hiện tại
```http
GET /auth/me
Authorization: Bearer <token>
```

### 📦 Products

#### Lấy danh sách sản phẩm
```http
GET /products?page=1&limit=10&category=food&search=pizza
```

#### Lấy chi tiết sản phẩm
```http
GET /products/:id
```

#### Tạo sản phẩm mới (Admin only)
```http
POST /products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Pizza Margherita",
  "description": "Pizza cổ điển với cà chua và phô mai",
  "price": 150000,
  "category": "pizza",
  "image": "pizza-margherita.jpg",
  "isAvailable": true
}
```

#### Cập nhật sản phẩm (Admin only)
```http
PUT /products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Pizza Margherita Updated",
  "price": 160000
}
```

#### Xóa sản phẩm (Admin only)
```http
DELETE /products/:id
Authorization: Bearer <admin_token>
```

### 📋 Orders

#### Lấy đơn hàng của user
```http
GET /orders
Authorization: Bearer <token>
```

#### Tạo đơn hàng mới
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderItems": [
    {
      "product": "product_id",
      "quantity": 2,
      "price": 150000
    }
  ],
  "shippingAddress": {
    "name": "Nguyen Van A",
    "phone": "0123456789",
    "address": "123 Nguyen Trai",
    "ward": "Phuong 1",
    "district": "Quan 1",
    "city": "Ho Chi Minh"
  },
  "paymentMethod": "cash",
  "note": "Giao hàng nhanh"
}
```

#### Lấy chi tiết đơn hàng
```http
GET /orders/:id
Authorization: Bearer <token>
```

#### Cập nhật trạng thái đơn hàng (Admin only)
```http
PUT /orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

### 👥 Users (Admin only)

#### Lấy danh sách người dùng
```http
GET /users
Authorization: Bearer <admin_token>
```

#### Lấy chi tiết người dùng
```http
GET /users/:id
Authorization: Bearer <admin_token>
```

#### Cập nhật trạng thái người dùng
```http
PUT /users/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false
}
```

#### Thay đổi vai trò người dùng
```http
PUT /users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "staff"
}
```

### 🎨 Banners (Admin only)

#### Lấy danh sách banner
```http
GET /banners
```

#### Tạo banner mới
```http
POST /banners
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Khuyến mãi đặc biệt",
  "description": "Giảm giá 50% cho tất cả pizza",
  "image": "banner1.jpg",
  "link": "/products?category=pizza",
  "isActive": true
}
```

#### Cập nhật banner
```http
PUT /banners/:id
Authorization: Bearer <admin_token>
```

#### Bật/tắt banner
```http
PUT /banners/:id/toggle
Authorization: Bearer <admin_token>
```

#### Xóa banner
```http
DELETE /banners/:id
Authorization: Bearer <admin_token>
```

### ⭐ Reviews

#### Lấy đánh giá của sản phẩm
```http
GET /reviews/product/:productId
```

#### Tạo đánh giá mới
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "product": "product_id",
  "rating": 5,
  "comment": "Sản phẩm rất ngon!"
}
```

#### Duyệt đánh giá (Admin only)
```http
PUT /reviews/:id/approve
Authorization: Bearer <admin_token>
```

#### Từ chối đánh giá (Admin only)
```http
PUT /reviews/:id/reject
Authorization: Bearer <admin_token>
```

### 📊 Statistics (Admin only)

#### Thống kê dashboard
```http
GET /statistics/dashboard
Authorization: Bearer <admin_token>
```

#### Thống kê doanh thu
```http
GET /statistics/revenue?period=month
Authorization: Bearer <admin_token>
```

#### Sản phẩm bán chạy
```http
GET /statistics/top-products
Authorization: Bearer <admin_token>
```

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## 🔢 Status Codes

- **200** - OK
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **500** - Internal Server Error

## 🎭 User Roles

- **user** - Khách hàng thông thường
- **staff** - Nhân viên
- **admin** - Quản trị viên

## 📋 Order Status

- **pending** - Chờ xác nhận
- **confirmed** - Đã xác nhận
- **preparing** - Đang chuẩn bị
- **shipping** - Đang giao hàng
- **delivered** - Đã giao hàng
- **cancelled** - Đã hủy

## 💳 Payment Methods

- **cash** - Thanh toán khi nhận hàng
- **bank** - Chuyển khoản ngân hàng
- **momo** - Ví MoMo
- **vnpay** - VNPay

## 🧪 Test với cURL

### Test đăng nhập
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nafood.com","password":"admin123"}'
```

### Test lấy sản phẩm
```bash
curl http://localhost:5000/api/products
```

### Test tạo đơn hàng
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"orderItems":[{"product":"PRODUCT_ID","quantity":1,"price":150000}]}'
```

## 🔍 Pagination

Các endpoint hỗ trợ phân trang:
```
GET /products?page=1&limit=10
GET /orders?page=2&limit=5
GET /users?page=1&limit=20
```

Response sẽ bao gồm thông tin phân trang:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pages": 5,
      "total": 50,
      "limit": 10
    }
  }
}
```

## 🔍 Search & Filter

### Tìm kiếm sản phẩm
```
GET /products?search=pizza&category=food&minPrice=100000&maxPrice=200000
```

### Lọc đơn hàng
```
GET /orders?status=pending&startDate=2024-01-01&endDate=2024-01-31
```

**📚 Tài liệu này cung cấp đầy đủ thông tin để tích hợp với Na Food API!**
