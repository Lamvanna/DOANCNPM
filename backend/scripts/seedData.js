const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const seedUsers = async () => {
    try {
        // Clear existing users
        await User.deleteMany({});

        const users = [
            {
                name: 'Administrator',
                email: 'admin@nafood.com',
                password: await bcrypt.hash('admin123', 12),
                role: 'admin',
                phone: '0123456789',
                isActive: true
            },
            {
                name: 'Staff User',
                email: 'staff@nafood.com',
                password: await bcrypt.hash('staff123', 12),
                role: 'staff',
                phone: '0987654321',
                isActive: true
            },
            {
                name: 'Nguyễn Văn A',
                email: 'user@nafood.com',
                password: await bcrypt.hash('user123', 12),
                role: 'user',
                phone: '0111222333',
                isActive: true,
                address: {
                    street: '123 Nguyễn Huệ',
                    ward: 'Phường Bến Nghé',
                    district: 'Quận 1',
                    city: 'TP.HCM'
                }
            }
        ];

        await User.insertMany(users);
        console.log('✅ Users seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding users:', error);
    }
};

const seedProducts = async () => {
    try {
        // Clear existing products
        await Product.deleteMany({});

        const products = [
            {
                name: 'Phở Bò Tái',
                description: 'Phở bò tái truyền thống với nước dùng đậm đà, thịt bò tái mềm ngon',
                price: 45000,
                originalPrice: 50000,
                category: 'Phở',
                image: '/assets/images/pho-bo-tai.jpg',
                isAvailable: true,
                isFeatured: true,
                tags: ['phở', 'bò', 'truyền thống'],
                nutritionInfo: {
                    calories: 350,
                    protein: 25,
                    carbs: 45,
                    fat: 8
                },
                preparationTime: 15,
                rating: 4.5,
                numReviews: 12,
                soldCount: 150
            },
            {
                name: 'Bún Bò Huế',
                description: 'Bún bò Huế cay nồng đặc trưng miền Trung với chả cua, giò heo',
                price: 50000,
                category: 'Bún',
                image: '/assets/images/bun-bo-hue.jpg',
                isAvailable: true,
                isFeatured: true,
                tags: ['bún', 'bò', 'huế', 'cay'],
                nutritionInfo: {
                    calories: 400,
                    protein: 28,
                    carbs: 50,
                    fat: 12
                },
                preparationTime: 20,
                rating: 4.3,
                numReviews: 8,
                soldCount: 95
            },
            {
                name: 'Cơm Tấm Sườn Nướng',
                description: 'Cơm tấm sườn nướng thơm lừng với chả trứng, bì và nước mắm pha',
                price: 55000,
                category: 'Cơm',
                image: '/assets/images/com-tam-suon.jpg',
                isAvailable: true,
                tags: ['cơm', 'sườn', 'nướng'],
                nutritionInfo: {
                    calories: 520,
                    protein: 35,
                    carbs: 60,
                    fat: 15
                },
                preparationTime: 25,
                rating: 4.7,
                numReviews: 15,
                soldCount: 200
            },
            {
                name: 'Bánh Mì Thịt Nướng',
                description: 'Bánh mì giòn rụm với thịt nướng thơm ngon, rau sống tươi mát',
                price: 25000,
                category: 'Bánh Mì',
                image: '/assets/images/banh-mi-thit-nuong.jpg',
                isAvailable: true,
                tags: ['bánh mì', 'thịt nướng'],
                nutritionInfo: {
                    calories: 280,
                    protein: 18,
                    carbs: 35,
                    fat: 8
                },
                preparationTime: 10,
                rating: 4.2,
                numReviews: 6,
                soldCount: 120
            },
            {
                name: 'Trà Đá Chanh',
                description: 'Trà đá chanh tươi mát, giải khát tuyệt vời',
                price: 15000,
                category: 'Nước Uống',
                image: '/assets/images/tra-da-chanh.jpg',
                isAvailable: true,
                tags: ['trà', 'chanh', 'giải khát'],
                nutritionInfo: {
                    calories: 25,
                    protein: 0,
                    carbs: 6,
                    fat: 0
                },
                preparationTime: 5,
                rating: 4.0,
                numReviews: 4,
                soldCount: 80
            },
            {
                name: 'Chè Ba Màu',
                description: 'Chè ba màu truyền thống với đậu xanh, đậu đỏ và thạch',
                price: 20000,
                category: 'Tráng Miệng',
                image: '/assets/images/che-ba-mau.jpg',
                isAvailable: true,
                tags: ['chè', 'tráng miệng', 'ngọt'],
                nutritionInfo: {
                    calories: 180,
                    protein: 5,
                    carbs: 35,
                    fat: 3
                },
                preparationTime: 8,
                rating: 4.4,
                numReviews: 7,
                soldCount: 65
            }
        ];

        await Product.insertMany(products);
        console.log('✅ Products seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding products:', error);
    }
};

const seedBanners = async () => {
    try {
        // Clear existing banners
        await Banner.deleteMany({});

        const banners = [
            {
                title: 'Khuyến Mãi Đặc Biệt',
                description: 'Giảm 20% cho tất cả món phở trong tuần này!',
                image: '/assets/images/banner-pho-sale.jpg',
                link: '/products?category=Phở',
                buttonText: 'Đặt Ngay',
                order: 1,
                isActive: true
            },
            {
                title: 'Món Mới Ra Mắt',
                description: 'Thử ngay bún bò Huế cay nồng đặc trưng miền Trung',
                image: '/assets/images/banner-bun-bo-hue.jpg',
                link: '/products/bun-bo-hue',
                buttonText: 'Khám Phá',
                order: 2,
                isActive: true
            },
            {
                title: 'Giao Hàng Miễn Phí',
                description: 'Miễn phí giao hàng cho đơn từ 100.000đ',
                image: '/assets/images/banner-free-ship.jpg',
                link: '/products',
                buttonText: 'Đặt Hàng',
                order: 3,
                isActive: true
            }
        ];

        await Banner.insertMany(banners);
        console.log('✅ Banners seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding banners:', error);
    }
};

const seedAll = async () => {
    try {
        await connectDB();
        
        console.log('🌱 Starting to seed database...');
        
        await seedUsers();
        await seedProducts();
        await seedBanners();
        
        console.log('🎉 Database seeded successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    seedAll();
}

module.exports = {
    seedUsers,
    seedProducts,
    seedBanners,
    seedAll
};
