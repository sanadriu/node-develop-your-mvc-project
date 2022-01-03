function notFoundHandler(req, res, next) {
  res.status(404).send({
    success: false,
    message: "Not found",
  });
}

module.exports = notFoundHandler;
