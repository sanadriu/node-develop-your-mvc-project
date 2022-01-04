function errorHandler(err, req, res, next) {
  res.status(500).send({
    success: false,
    message: "Server Error",
  });
}

module.exports = errorHandler;
