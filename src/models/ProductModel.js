const { Schema, model } = require("mongoose");

const ProductSchema = Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
  },
});

const ProductModel = model("products", ProductSchema);

module.exports = ProductModel;
