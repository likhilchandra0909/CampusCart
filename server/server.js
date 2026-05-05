require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const wishlistRoutes = require('./routes/wishlist');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const server = http.createServer(app);

// Use Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP if it interferes with external assets like Google Fonts/Avatars for now
}));

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

const PORT = process.env.PORT || 5000;

// CORS — restrict to known client origin
app.use(cors({
    origin: CLIENT_URL,
    credentials: true,
}));

app.use(express.json());

// Global Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', globalLimiter);

// Basic logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Rate limiting — protect auth endpoints (more restrictive)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // Increased from 20 to 100 to allow for more refreshes during development
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again in 15 minutes.' }
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campuskart')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CampusKart API running' });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ── Socket.IO ─────────────────────────────────────────────
let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('addUser', (userId) => {
        addUser(userId, socket.id);
        io.emit('getUsers', users);
    });

    socket.on('sendMessage', ({ senderId, receiverId, text, conversationId }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit('getMessage', {
                senderId,
                text,
                conversationId,
                createdAt: new Date(),
            });
        }
    });

    socket.on('typing', ({ senderId, receiverId, conversationId }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit('displayTyping', { senderId, conversationId });
        }
    });

    socket.on('stopTyping', ({ senderId, receiverId, conversationId }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit('hideTyping', { senderId, conversationId });
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected!');
        removeUser(socket.id);
        io.emit('getUsers', users);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
