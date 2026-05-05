const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    avatar: { type: String, default: 'https://ui-avatars.com/api/?name=User' },
    university: { type: String, default: 'University' },
    major: { type: String, default: 'Student' },
    is2FAEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    rating: { type: Number, default: 5.0 },
    totalEarnings: { type: Number, default: 0 },
    itemsSold: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
