const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const auth = require('../middleware/auth');

// @route   GET api/wishlist
router.get('/', auth, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user.id, products: [] });
            await wishlist.save();
        }
        res.json(wishlist);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/wishlist/:productId
router.post('/:productId', auth, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user.id });
        }
        
        if (!wishlist.products.includes(req.params.productId)) {
            wishlist.products.push(req.params.productId);
            await wishlist.save();
        }
        
        wishlist = await wishlist.populate('products');
        res.json(wishlist);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/wishlist/:productId
router.delete('/:productId', auth, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        if (wishlist) {
            wishlist.products = wishlist.products.filter(
                product => product.toString() !== req.params.productId
            );
            await wishlist.save();
            wishlist = await wishlist.populate('products');
            res.json(wishlist);
        } else {
            res.status(404).json({ message: 'Wishlist not found' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
