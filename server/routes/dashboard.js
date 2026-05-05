const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// @route   GET api/dashboard
// @desc    Get user dashboard stats and activity
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Total Products Added by user
        const productsAdded = await Product.countDocuments({ seller: userId });

        // 2. Total Products Bought (Placeholder - can be expanded if Order model is added)
        const productsBought = 0; 

        // 3. Recent Products Added
        const recentProducts = await Product.find({ seller: userId })
            .sort({ createdAt: -1 })
            .limit(5);

        // 4. Recent Purchases (Placeholder)
        const recentOrders = [];

        res.json({
            productsAdded,
            productsBought,
            recentProducts,
            recentOrders
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
