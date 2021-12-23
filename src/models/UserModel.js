const { Schema, model } = require("mongoose");
const validator = require("validator");

const UserSchema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
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
      required: true,
      enum: ["customer", "admin", "manager"],
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
      enum: ["es-ES", "fr-FR", "en-GB", "it-IT", "de-DE"],
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
          required: true,
          trim: true,
          maxlength: 64,
        },
        city: {
          type: String,
          required: true,
          trim: true,
          maxlength: 48,
        },
        countryCode: {
          type: String,
          required: true,
          trim: true,
          enum: ["ES", "FR", "GB", "DE", "IT"],
        },
        postalCode: {
          type: String,
          required: true,
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

const UserModel = model("user", UserSchema);

module.exports = UserModel;
