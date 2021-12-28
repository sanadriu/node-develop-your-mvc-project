const { Schema, model } = require("mongoose");
const validator = require("validator");

const productSchema = new Schema({
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
  images: [
    {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isURL(value);
        },
        message: function (props) {
          return `${props.value} is not a valid URL for image`;
        },
      },
    },
  ],
});

const ProductModel = model("products", productSchema);

module.exports = ProductModel;
