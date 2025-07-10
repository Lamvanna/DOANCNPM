#!/usr/bin/env node

const mongoose = require('mongoose');
const { seedAll } = require('./seedData');
require('dotenv').config();

const setup = async () => {
    try {
        console.log('🚀 Setting up Na Food backend...\n');

        // Connect to database
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Run seed data
        console.log('🌱 Seeding database with initial data...');
        await seedAll();
        console.log('✅ Database seeded successfully\n');

        console.log('🎉 Setup completed successfully!');
        console.log('\n📋 Default accounts created:');
        console.log('   Admin: admin@nafood.com / admin123');
        console.log('   Staff: staff@nafood.com / staff123');
        console.log('   User:  user@nafood.com / user123');
        console.log('\n🌐 You can now start the server with: npm run dev');

        process.exit(0);
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
};

// Run setup if this file is executed directly
if (require.main === module) {
    setup();
}

module.exports = setup;
