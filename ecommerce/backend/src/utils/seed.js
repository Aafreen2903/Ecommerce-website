// src/utils/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

dotenv.config();

const productsData = [
  {
    title: 'Precision Wireless ANC Headphones',
    description: 'Immersive sound quality with industry-leading active noise cancellation. 40 hours battery life with quick charging, plush memory foam earcups, and dual beamforming microphones.',
    category: 'Electronics',
    brand: 'Audiotech',
    price: 299.99,
    discountPrice: 249.99,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=60'
    ],
    ratings: 4.8,
    reviews: [
      { name: 'John Doe', rating: 5, comment: 'Best headphones I have ever owned. Super clean audio and comfortable fit!' },
      { name: 'Sarah Miller', rating: 4.5, comment: 'ANC is fantastic, but the app is a bit clunky.' }
    ],
    numReviews: 2
  },
  {
    title: 'Smart Fitness Tracker Pro',
    description: 'Track your steps, heart rate, sleep quality, and workouts with ease. 5 ATM water resistance, built-in GPS, blood oxygen saturation monitor, and up to 14 days of battery life.',
    category: 'Electronics',
    brand: 'FitBand',
    price: 129.99,
    discountPrice: 99.99,
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=60'
    ],
    ratings: 4.5,
    reviews: [
      { name: 'Alice Smith', rating: 4, comment: 'Very accurate tracker. Syncs well with my phone.' }
    ],
    numReviews: 1
  },
  {
    title: 'Ergonomic Mesh Office Chair',
    description: 'Adjustable headrest, 3D armrests, lumbar support, and tilt mechanism. High-density mesh keeps your back cool for hours of comfortable sitting during work or gaming sessions.',
    category: 'Home & Office',
    brand: 'WorkFit',
    price: 349.99,
    discountPrice: 289.99,
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=60'
    ],
    ratings: 4.6,
    reviews: [
      { name: 'Bob Vance', rating: 5, comment: 'Saved my back! Highly adjustable and very durable.' }
    ],
    numReviews: 1
  },
  {
    title: 'Ultra-Quiet Personal Blender',
    description: 'Blend smoothies, shakes, and iced drinks in seconds. High-torque 900W motor, stainless steel extractor blades, and dishwasher-safe travel cups with leak-proof lids.',
    category: 'Home & Kitchen',
    brand: 'NutriWave',
    price: 89.99,
    discountPrice: 0,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800&auto=format&fit=crop&q=60'
    ],
    ratings: 4.2,
    reviews: [
      { name: 'Charlie Kelly', rating: 4, comment: 'Works well for basic protein shakes. Clean up is quick.' }
    ],
    numReviews: 1
  },
  {
    title: 'Premium Leather Minimalist Wallet',
    description: 'Sleek RFID-blocking cardholder made from full-grain vegetable-tanned leather. Holds up to 10 cards and features a quick-access ejector trigger for convenience.',
    category: 'Accessories',
    brand: 'Hide & Seek',
    price: 59.99,
    discountPrice: 49.99,
    stock: 100,
    images: [
      'https://images.unsplash.com/photo-1627124765138-b7945d8b725b?w=800&auto=format&fit=crop&q=60'
    ],
    ratings: 4.7,
    reviews: [
      { name: 'Diana Prince', rating: 5, comment: 'Beautiful construction and super thin profile. Fits perfectly in front pocket.' }
    ],
    numReviews: 1
  },
  {
    title: 'Retro Mechanical Keyboard (RGB)',
    description: 'Classic typewriter style round keycaps, clicky blue mechanical switches, and customizable multi-mode RGB backlighting. Solid metal plate base with USB-C wired connection.',
    category: 'Electronics',
    brand: 'TypeWriter',
    price: 119.99,
    discountPrice: 89.99,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=60'
    ],
    ratings: 4.4,
    reviews: [],
    numReviews: 0
  },
  {
    title: 'Stainless Steel Insulated Water Bottle',
    description: 'Double-walled vacuum insulation keeps beverages cold for 24 hours or hot for 12 hours. Sweat-free powder coating, food-grade 18/8 steel, and leakproof straw lid.',
    category: 'Fitness & Outdoors',
    brand: 'HydroFlow',
    price: 29.99,
    discountPrice: 24.99,
    stock: 150,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=60'
    ],
    ratings: 4.9,
    reviews: [],
    numReviews: 0
  },
  {
    title: 'Double-Width Camping Hammock',
    description: 'Extra large dimensions, crafted from breathable 210T parachute nylon. Includes heavy-duty tree straps and carabiners. Packs down into an integrated storage sack.',
    category: 'Fitness & Outdoors',
    brand: 'AdventureBound',
    price: 49.99,
    discountPrice: 0,
    stock: 60,
    images: [
      'https://images.unsplash.com/photo-1542880941-1abfea46bba6?w=800&auto=format&fit=crop&q=60'
    ],
    ratings: 4.3,
    reviews: [],
    numReviews: 0
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB!');

    // Clear existing collections
    console.log('Cleaning collections...');
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();

    // Create seed products
    console.log('Seeding products...');
    const createdProducts = await Product.insertMany(productsData);
    console.log(`Successfully seeded ${createdProducts.length} products!`);

    // Create users
    console.log('Seeding users...');
    
    // Hash password for seeding
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isBlocked: false,
    });

    const customerUser = new User({
      name: 'John Doe',
      email: 'customer@example.com',
      password: hashedPassword,
      role: 'customer',
      isBlocked: false,
      wishlist: [createdProducts[0]._id, createdProducts[4]._id],
    });

    const secondCustomer = new User({
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: hashedPassword,
      role: 'customer',
      isBlocked: false,
    });

    const savedAdmin = await adminUser.save();
    const savedCustomer = await customerUser.save();
    const savedSecondCustomer = await secondCustomer.save();
    console.log('Users seeded!');

    // Create seed orders
    console.log('Seeding orders...');
    const order1 = new Order({
      user: savedCustomer._id,
      products: [
        {
          product: createdProducts[0]._id,
          title: createdProducts[0].title,
          quantity: 1,
          price: createdProducts[0].discountPrice || createdProducts[0].price,
          image: createdProducts[0].images[0]
        },
        {
          product: createdProducts[1]._id,
          title: createdProducts[1].title,
          quantity: 2,
          price: createdProducts[1].discountPrice || createdProducts[1].price,
          image: createdProducts[1].images[0]
        }
      ],
      shippingAddress: {
        address: '123 Main St',
        city: 'New York',
        postalCode: '10001',
        country: 'USA'
      },
      paymentInfo: {
        id: 'ch_simulated_payment_1',
        status: 'succeeded',
        method: 'Stripe'
      },
      orderStatus: 'Delivered',
      totalAmount: 449.97
    });

    const order2 = new Order({
      user: savedSecondCustomer._id,
      products: [
        {
          product: createdProducts[0]._id,
          title: createdProducts[0].title,
          quantity: 1,
          price: createdProducts[0].discountPrice || createdProducts[0].price,
          image: createdProducts[0].images[0]
        },
        {
          product: createdProducts[2]._id,
          title: createdProducts[2].title,
          quantity: 1,
          price: createdProducts[2].discountPrice || createdProducts[2].price,
          image: createdProducts[2].images[0]
        }
      ],
      shippingAddress: {
        address: '456 Oak Ave',
        city: 'San Francisco',
        postalCode: '94102',
        country: 'USA'
      },
      paymentInfo: {
        id: 'ch_simulated_payment_2',
        status: 'succeeded',
        method: 'Stripe'
      },
      orderStatus: 'Processing',
      totalAmount: 539.98
    });

    const savedOrder1 = await order1.save();
    const savedOrder2 = await order2.save();

    // Attach order history to user
    savedCustomer.orderHistory.push(savedOrder1._id);
    await savedCustomer.save();

    savedSecondCustomer.orderHistory.push(savedOrder2._id);
    await savedSecondCustomer.save();

    console.log('Orders seeded successfully!');

    // Close connection
    await mongoose.connection.close();
    console.log('Database seeding finished. Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
