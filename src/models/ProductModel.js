const { Schema, model } = require("mongoose");
const validator = require("validator");

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [64, "Title length must not be longer than 64 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [
        512,
        "Description length must not be longer than 512 characters",
      ],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be greater or equal than 0"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock must be greater or equal than 0"],
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
            return `${props.value} is not a valid URL for images`;
          },
        },
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

const ProductModel = model("product", productSchema);

module.exports = ProductModel;
