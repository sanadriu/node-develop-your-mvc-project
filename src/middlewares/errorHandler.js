const log = require("../services/logger");

function errorHandler(err, req, res, next) {
  log.warn(err.message);

  res.status(500).send({
    success: false,
    message: "Server Error",
  });
}

module.exports = errorHandler;
