const { UserModel, ProductModel, OrderModel } = require("../models");

const data = require("./sample-data");

async function seedData() {
  await UserModel.deleteMany();
  await ProductModel.deleteMany();
  await OrderModel.deleteMany();

  await UserModel.insertMany(data.users);
  await ProductModel.insertMany(data.products);
  await OrderModel.insertMany(await data.orders());
}

module.exports = seedData;
