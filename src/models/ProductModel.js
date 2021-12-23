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
    min: 10,
    max: 200,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    max: 50,
  },
  description: {
    type: String,
    trim: true,
  },
});

const ProductModel = model("products", ProductSchema);

module.exports = ProductModel;
