const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { 
        type: String, 
        enum: ['MESSAGE', 'SALE', 'WISHLIST_DROP', 'SYSTEM'], 
        required: true 
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    relatedId: { type: String }, // e.g., conversationId or productId
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
