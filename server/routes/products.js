const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET api/products
router.get('/', async (req, res) => {
    try {
        let query = {};
        if (req.query.category) query.category = req.query.category;
        if (req.query.condition) query.condition = req.query.condition;
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        const products = await Product.find(query).populate('seller', 'name avatar university major');
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller', 'name avatar university major');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Product not found' });
        res.status(500).send('Server Error');
    }
});

// @route   POST api/products (with image upload, max 5 files)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
    try {
        // Build image URLs from uploaded files
        // Cloudinary returns full URL in file.path; local disk uses file.filename
        const imageUrls = req.files
            ? req.files.map(file => file.path)
            : [];

        const newProduct = new Product({
            title: req.body.title,
            description: req.body.description,
            price: Number(req.body.price),
            category: req.body.category,
            condition: req.body.condition,
            images: imageUrls,
            seller: req.user.id
        });
        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/products/:id
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check ownership
        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Build image URLs if new files are uploaded
        const imageUrls = req.files && req.files.length > 0
            ? req.files.map(file => file.path)
            : product.images;

        // Update fields
        product.title = req.body.title || product.title;
        product.description = req.body.description || product.description;
        product.price = req.body.price !== undefined ? Number(req.body.price) : product.price;
        product.category = req.body.category || product.category;
        product.condition = req.body.condition || product.condition;
        product.images = imageUrls;

        await product.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Product not found' });
        res.status(500).send('Server Error');
    }
});

module.exports = router;
