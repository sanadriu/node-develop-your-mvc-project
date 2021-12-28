const { Schema, model } = require("mongoose");
const validator = require("validator");

const userSchema = new Schema(
  {
    uid: {
      type: String,
      required: [true, "UID is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      maxlength: [64, "Email length must not be longer than 64 characters"],
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: function (props) {
          return `${props.value} is not a valid email`;
        },
      },
    },
    role: {
      type: String,
      enum: {
        values: ["customer", "admin", "admin-root"],
        message: "Given role is not valid",
      },
      default: "customer",
    },
    name: {
      type: String,
      trim: true,
      maxlength: [32, "Name length must not be longer than 32 characters"],
    },
    surname: {
      type: String,
      trim: true,
      maxlength: [32, "Surname length must not be longer than 32 characters"],
    },
    phoneLocale: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isLocale(value);
        },
        message: function (props) {
          return `${props.value} is not a valid locale`;
        },
      },
    },
    phoneNumber: {
      type: Number,
      trim: true,
      validate: {
        validator: function (value) {
          return this.phoneLocale
            ? validator.isMobilePhone(value.toString(), this.phoneLocale)
            : true;
        },
        message: function (props) {
          return `${props.value} is not a valid phone for the specified locale`;
        },
      },
    },
    addresses: [
      {
        address: {
          type: String,
          required: [true, "Address is required"],
          trim: true,
          maxlength: 64,
        },
        city: {
          type: String,
          required: [true, "City is required"],
          trim: true,
          maxlength: 48,
        },
        countryCode: {
          type: String,
          required: [true, "Country code is required"],
          trim: true,
          enum: ["ES", "FR", "GB", "DE", "IT"],
        },
        postalCode: {
          type: String,
          required: [true, "Postal code is required"],
          trim: true,
          validate: {
            validator: function (value) {
              return validator.isPostalCode(value, this.countryCode);
            },
            message: function (props) {
              return `${props.value} is not a valid postal code for the specified country`;
            },
          },
        },
      },
    ],
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret, options) {
    delete ret._id;

    ret.addresses.forEach((address) => {
      address.id = address._id;
      delete address._id;
    });
  },
});

const UserModel = model("user", userSchema);

module.exports = UserModel;
