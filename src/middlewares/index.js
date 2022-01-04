const notFoundHandler = require("./notFoundHandler");
const errorHandler = require("./errorHandler");
const authMiddleware = require("./authMiddleware");
const accessMiddleware = require("./accessMiddleware");
const filterMiddleware = require("./filterMiddleware");
const filterSomeMiddleware = require("./filterSomeMiddleware");
const filterEveryMiddleware = require("./filterEveryMiddleware");

module.exports = {
  notFoundHandler,
  errorHandler,
  authMiddleware,
  accessMiddleware,
  filterMiddleware,
  filterSomeMiddleware,
  filterEveryMiddleware,
};
