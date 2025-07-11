const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: String
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [orderItemSchema],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    shippingFee: {
        type: Number,
        default: 0,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'],
            message: 'Trạng thái đơn hàng không hợp lệ'
        },
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: {
            values: ['cod', 'bank_transfer', 'momo', 'vnpay'],
            message: 'Phương thức thanh toán không hợp lệ'
        },
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDetails: {
        transactionId: String,
        paidAt: Date,
        paymentGateway: String
    },
    shippingAddress: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        ward: String,
        district: String,
        city: {
            type: String,
            required: true
        },
        note: String
    },
    deliveredAt: Date,
    cancelReason: String,
    note: String,
    staffNotes: String,
    statusHistory: [{
        status: String,
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        const count = await this.constructor.countDocuments();
        this.orderNumber = `NF${Date.now()}${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Calculate total price if not set
orderSchema.pre('save', function(next) {
    if (!this.totalPrice && this.orderItems && this.orderItems.length > 0) {
        this.totalPrice = this.orderItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    next();
});

// Create unique index for orderNumber
orderSchema.index({ orderNumber: 1 }, { unique: true });

module.exports = mongoose.model('Order', orderSchema);
