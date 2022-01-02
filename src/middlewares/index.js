const notFound = require("./notFoundHandler");
const error = require("./errorHandler");
const authMiddleware = require("./authMiddleware");
const accessMiddleware = require("./accessMiddleware");
const filterMiddleware = require("./filterMiddleware");

module.exports = {
  notFound,
  error,
  authMiddleware,
  accessMiddleware,
  filterMiddleware,
};
