function errorHandler(err, req, res, next) {
  res.status(500).send({
    success: false,
    message: err.message,
  });
}

module.exports = errorHandler;
