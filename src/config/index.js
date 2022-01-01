const dotenv = require("dotenv");
dotenv.config();

const production = require("./config-prod");
const development = require("./config-dev");
const test = require("./config-test");

const ENV = process.env.NODE_ENV || "development";

const CONFIG = {
  production,
  development,
  test,
};

module.exports = CONFIG[ENV];
