// MongoDB initialization script
db = db.getSiblingDB('nafood');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('reviews');
db.createCollection('banners');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.products.createIndex({ "name": "text", "description": "text" });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "price": 1 });
db.orders.createIndex({ "userId": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": -1 });
db.reviews.createIndex({ "productId": 1 });
db.reviews.createIndex({ "userId": 1 });

// Insert default admin user (password: admin123 - hashed with bcrypt)
db.users.insertOne({
    name: "Administrator",
    email: "admin@nafood.com",
    password: "$2b$10$8K1p/a0dCVWHxqRXnqUNe.RT8DCoCmHeCGhU4PJWfyOJXzYhkXXuO", // admin123
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
});

// Insert default staff user (password: staff123)
db.users.insertOne({
    name: "Staff User",
    email: "staff@nafood.com", 
    password: "$2b$10$8K1p/a0dCVWHxqRXnqUNe.RT8DCoCmHeCGhU4PJWfyOJXzYhkXXuO", // staff123
    role: "staff",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
});

// Insert sample products
db.products.insertMany([
    {
        name: "Phở Bò Tái",
        description: "Phở bò tái truyền thống với nước dùng đậm đà, thịt bò tái mềm ngon",
        price: 45000,
        category: "Phở",
        image: "/assets/images/pho-bo-tai.jpg",
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Bún Bò Huế",
        description: "Bún bò Huế cay nồng đặc trưng miền Trung với chả cua, giò heo",
        price: 50000,
        category: "Bún",
        image: "/assets/images/bun-bo-hue.jpg",
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Cơm Tấm Sườn Nướng",
        description: "Cơm tấm sườn nướng thơm lừng với chả trứng, bì và nước mắm pha",
        price: 55000,
        category: "Cơm",
        image: "/assets/images/com-tam-suon-nuong.jpg",
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Bánh Mì Thịt Nướng",
        description: "Bánh mì giòn rụm với thịt nướng thơm ngon, rau sống tươi mát",
        price: 25000,
        category: "Bánh Mì",
        image: "/assets/images/banh-mi-thit-nuong.jpg",
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);

// Insert sample banners
db.banners.insertMany([
    {
        title: "Khuyến mãi đặc biệt",
        description: "Giảm 20% cho đơn hàng đầu tiên",
        image: "/assets/images/banner1.jpg",
        link: "#",
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: "Món mới hấp dẫn",
        description: "Thử ngay các món ăn mới nhất tại Na Food",
        image: "/assets/images/banner2.jpg", 
        link: "#",
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);

print("Database initialized successfully!");
