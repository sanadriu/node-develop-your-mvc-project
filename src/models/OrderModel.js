const { Schema, model } = require("mongoose");
const validator = require("validator");

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User ID is required"],
    },
    shippingAddress: {
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
        maxlength: [64, "Address length must not be longer than 64 characters"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        maxlength: [64, "City length must not be longer than 64 characters"],
      },
      countryCode: {
        type: String,
        required: [true, "Country code is required"],
        trim: true,
        validate: {
          validator: function (value) {
            return validator.isISO31661Alpha2(value);
          },
          message: function (props) {
            return `${props.value} is not a valid country code`;
          },
        },
      },
      postalCode: {
        type: String,
        required: [true, "Postal code is required"],
        trim: true,
        validate: {
          validator: function (value) {
            return validator.isPostalCode(
              value,
              this.shippingAddress.countryCode,
            );
          },
          message: function (props) {
            return `${props.value} is not a valid postal code for the given country code`;
          },
        },
      },
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: [0, "Shipping cost must be greater or equal than 0"],
    },
    products: [
      {
        _id: false,
        product: {
          type: Schema.Types.ObjectId,
          ref: "product",
          required: [true, "Product must include its correspondent ID"],
        },
        price: {
          type: Number,
          required: [true, "Product must include its correspondent price"],
          min: [0, "Price must be greater or equal than 0"],
        },
        units: {
          type: Number,
          required: [true, "Product must include the number of units"],
          min: [0, "Units must be greater or equal than 0"],
        },
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

const OrderModel = model("order", orderSchema);

module.exports = OrderModel;
