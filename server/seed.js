require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campuskart';

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected for seeding...');

        await User.deleteMany();
        await Product.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const alex = new User({
            name: 'Alex Thompson',
            email: 'alex.t@university.edu',
            password: hashedPassword,
            major: 'Computer Science',
            rating: 4.8,
            totalEarnings: 1240.50,
            itemsSold: 24
        });
        
        const sarah = new User({
            name: 'Sarah Jenkins',
            email: 'sarah.j@university.edu',
            password: hashedPassword,
            major: 'Biology',
            rating: 4.9
        });

        await alex.save();
        await sarah.save();

        const products = [
            {
                title: 'Sony WH-1000XM4 Studio Graphite',
                description: 'Industry-leading noise cancellation. Perfect for focus during finals week. Used for one semester, pristine condition. Original case and cables included.',
                price: 219.00,
                category: 'Audio',
                condition: 'Like New',
                seller: alex._id,
                features: [
                    { title: 'Adaptive Sound Control', description: 'Automatically adjusts to your surroundings to provide the best noise-canceling experience whether in the library or the bus.' },
                    { title: '30-Hour Battery Life', description: 'Get through an entire study marathon without needing a charge. 10 mins charge = 5 hours play.' },
                    { title: 'Intuitive Touch Controls', description: 'Change tracks, volume, or activate your voice assistant with a simple tap or swipe on the panel.' }
                ],
                images: ['/images/headphones.jpg']
            },
            {
                title: 'Organic Chemistry: Vol II',
                description: 'Latest edition. Minimal highlighting in chapter 4. Perfect for pre-med students.',
                price: 45.00,
                category: 'Textbooks',
                condition: 'Good',
                seller: sarah._id,
                images: ['/images/book-chem.jpg']
            },
            {
                title: 'MacBook Air M2',
                description: 'Pristine condition, includes original charger...',
                price: 850.00,
                category: 'Electronics',
                condition: 'Like New',
                seller: alex._id,
                images: ['/images/macbook.jpg']
            },
            {
                title: 'Aura Desk Lamp Pro',
                description: 'Adjustable brightness and color temp. USB-C charging port included.',
                price: 29.99,
                category: 'Furniture',
                condition: 'New',
                seller: sarah._id,
                images: ['/images/lamp.jpg']
            },
            {
                title: 'Nomad Study Pack',
                description: 'Water-resistant with 15" laptop sleeve. Only used for one semester.',
                price: 35.00,
                category: 'Accessories',
                condition: 'Good',
                seller: alex._id,
                images: ['/images/backpack.jpg']
            },
            {
                title: 'iPhone 13 - 128GB',
                description: 'Unlocked. Battery health 92%. Comes with original box and cable.',
                price: 420.00,
                category: 'Electronics',
                condition: 'Good',
                seller: sarah._id,
                images: ['/images/iphone.jpg']
            }
        ];

        await Product.insertMany(products);

        console.log('Database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDatabase();
