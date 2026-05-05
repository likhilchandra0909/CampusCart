const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        user = new User({ name, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, ...user._doc } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST api/auth/google
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, email, sub, picture } = ticket.getPayload();

        let user = await User.findOne({ email });
        if (!user) {
            // Create a new user if it doesn't exist
            user = new User({
                name,
                email,
                googleId: sub,
                authProvider: 'google',
                avatar: picture
            });
            await user.save();
        } else if (!user.googleId) {
            // Link google account to existing email
            user.googleId = sub;
            user.authProvider = 'google';
            if (picture) user.avatar = picture;
            await user.save();
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
            if (err) throw err;
            res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email, ...user._doc } });
        });
    } catch (err) {
        console.error("Google auth error:", err.message);
        res.status(500).json({ message: 'Google Authentication failed. Wait, did you configure GOOGLE_CLIENT_ID in server/.env?' });
    }
});

// @route   GET api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/profile
router.put('/profile', auth, async (req, res) => {
    const { name, university, major, avatar } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (university) user.university = university;
        if (major) user.major = major;
        if (avatar) user.avatar = avatar;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/2fa
router.put('/2fa', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.is2FAEnabled = !user.is2FAEnabled;
        await user.save();
        res.json({ is2FAEnabled: user.is2FAEnabled });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
