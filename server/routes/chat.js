const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @route   POST api/chat
// @desc    Create or get conversation
// @access  Private
router.post('/', auth, async (req, res) => {
    const { sellerId, productId } = req.body;
    const buyerId = req.user.id;

    if (sellerId === buyerId) {
        return res.status(400).json({ message: 'You cannot chat with yourself' });
    }

    try {
        let conversation = await Conversation.findOne({
            members: { $all: [buyerId, sellerId] },
            product: productId
        });

        if (!conversation) {
            conversation = new Conversation({
                members: [buyerId, sellerId],
                product: productId,
                unreadCount: { [sellerId]: 0, [buyerId]: 0 }
            });
            await conversation.save();
        }

        res.json(conversation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/chat
// @desc    Get all conversations of logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            members: { $in: [req.user.id] }
        })
        .populate('members', 'name avatar')
        .populate('product', 'title images price')
        .sort({ lastMessageAt: -1 });

        res.json(conversations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/chat/messages
// @desc    Send a message
// @access  Private
router.post('/messages', auth, async (req, res) => {
    const { conversationId, text } = req.body;
    const senderId = req.user.id;

    try {
        const newMessage = new Message({
            conversationId,
            sender: senderId,
            text
        });

        const savedMessage = await newMessage.save();

        // Update conversation meta
        const conversation = await Conversation.findById(conversationId);
        conversation.lastMessage = text;
        conversation.lastMessageAt = Date.now();
        
        // Increment unread count for other members
        conversation.members.forEach(memberId => {
            if (memberId.toString() !== senderId) {
                const currentCount = conversation.unreadCount.get(memberId.toString()) || 0;
                conversation.unreadCount.set(memberId.toString(), currentCount + 1);
            }
        });

        await conversation.save();

        // Create notification for recipient
        const recipientId = conversation.members.find(m => m.toString() !== senderId);
        const sender = await User.findById(senderId); // Assuming User is needed, but we can just use req.user.name
        
        const notification = new Notification({
            recipient: recipientId,
            sender: senderId,
            type: 'MESSAGE',
            title: 'New Message',
            content: `You received a message from ${sender?.name || 'a user'}`,
            relatedId: conversationId
        });
        await notification.save();

        res.json(savedMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/chat/messages/:conversationId
// @desc    Get all messages for a conversation
// @access  Private
router.get('/messages/:conversationId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/chat/seen/:conversationId
// @desc    Mark messages as seen
// @access  Private
router.put('/seen/:conversationId', auth, async (req, res) => {
    try {
        await Message.updateMany(
            { conversationId: req.params.conversationId, sender: { $ne: req.user.id }, seen: false },
            { $set: { seen: true } }
        );

        // Reset unread count for current user
        const conversation = await Conversation.findById(req.params.conversationId);
        if (conversation) {
            conversation.unreadCount.set(req.user.id, 0);
            await conversation.save();
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
