const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Product = require("./src/models/Product");

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const products = [
  {
    title: "iPhone 15",
    description: "Apple flagship smartphone",
    category: "Electronics",
    brand: "Apple",
    price: 799,
    discountPrice: 749,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"
    ],
    stock: 25,
    ratings: 4.8
  },
  {
    title: "Samsung Galaxy S24",
    description: "Latest Samsung flagship",
    category: "Electronics",
    brand: "Samsung",
    price: 699,
    discountPrice: 649,
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800"
    ],
    stock: 20,
    ratings: 4.7
  },
  {
    title: "Sony WH-1000XM5",
    description: "Premium Noise Cancelling Headphones",
    category: "Accessories",
    brand: "Sony",
    price: 399,
    discountPrice: 349,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
    ],
    stock: 50,
    ratings: 4.9
  },
  {
    title: "Gaming Mouse",
    description: "RGB Gaming Mouse",
    category: "Accessories",
    brand: "Logitech",
    price: 59,
    discountPrice: 49,
    images: [
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800"
    ],
    stock: 100,
    ratings: 4.5
  }
];

const seed = async () => {
  try {
    await Product.deleteMany();
    await Product.insertMany(products);

    console.log("Products Seeded");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();