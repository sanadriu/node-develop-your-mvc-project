const mongoose = require("mongoose");
const log = require("../services/logger");
const { UserModel, ProductModel, OrderModel } = require("../models");

const data = require("../data");
const config = require("../config");
const options = {
  autoIndex: true,
};

async function connect() {
  await mongoose.connect(config.db.url, options);

  mongoose.connection.on("error", (error) => log.error(error.message));
}

async function seed() {
  await UserModel.deleteMany();
  await ProductModel.deleteMany();
  await OrderModel.deleteMany();

  await UserModel.insertMany(data.users);
  await ProductModel.insertMany(data.products);
  await OrderModel.insertMany(await data.orders());
}

module.exports = { connect, seed };
