const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Product Schema (embedded within Order)
const ProductSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Assumes referencing another collection of Products
    required: true,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Order Schema
const OrderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // Refers to the User collection
    required: true,
    ref: "User",
  },
  products: [ProductSchema], // Array of products, each with quantity and price

  paymentMethod: {
    type: String,
    enum: ["cod", "onlinePayment"],
    required: true,
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  
  orderDate: {
    type: Date,
    default: Date.now,
  },

  status: {
    type: String,
    enum: ["pending", "processing", "shipping", "completed", "cancelled"],
    default: "processing",
  },

  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },

  subtotal: {
    type: Number,
    default: 0,
  },

  tax: {
    type: Number,
    default: 0,
  },

  taxRate: {
    type: Number,
    default: 0,
  },

  shippingFee: {
    type: Number,
    default: 0,
  },

  shippingLocation: {
    type: String,
    enum: ["major", "other"],
  },
});

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;