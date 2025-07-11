const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên'],
        trim: true,
        maxlength: [50, 'Tên không được vượt quá 50 ký tự']
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Vui lòng nhập email hợp lệ'
        ]
    },
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
        minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
        select: false
    },
    phone: {
        type: String,
        match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
    },
    address: {
        street: String,
        ward: String,
        district: String,
        city: String
    },
    role: {
        type: String,
        enum: ['user', 'staff', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    avatar: {
        type: String,
        default: '/assets/images/default-avatar.png'
    },
    lastLogin: {
        type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Encrypt password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Get user without sensitive data
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpire;
    return user;
};

// Create unique index for email
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
