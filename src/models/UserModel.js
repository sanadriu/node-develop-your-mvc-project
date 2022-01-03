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
        values: ["customer", "admin", "main-admin"],
        message: "The given role is not valid",
      },
      default: "customer",
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [32, "Firstname length must not be longer than 32 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [32, "Lastname length must not be longer than 32 characters"],
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
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return this.phoneLocale
            ? validator.isMobilePhone(value, this.phoneLocale, {
                strictMode: true,
              })
            : true;
        },
        message: function (props) {
          return `${props.value} is not a valid phone for the specified locale`;
        },
      },
    },
    addresses: [
      {
        _id: false,
        address: {
          type: String,
          required: [true, "Address is required"],
          trim: true,
          maxlength: [
            64,
            "Address length must not be longer than 64 characters",
          ],
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
              return validator.isPostalCode(value, this.countryCode);
            },
            message: function (props) {
              return `${props.value} is not a valid postal code for the given country code`;
            },
          },
        },
      },
    ],
  },
  { timestamps: true },
);

// userSchema.set("toJSON", {
//   virtuals: true,
//   versionKey: false,
//   transform: function (doc, ret, options) {
//     delete ret._id;

//     ret.addresses.forEach((address) => {
//       address.id = address._id;
//       delete address._id;
//     });
//   },
// });

const UserModel = model("user", userSchema);

module.exports = UserModel;
