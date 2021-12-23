function notFound(req, res, next) {
  res.status(404).send({
    success: false,
    message: "Resource not found",
  });
}

module.exports = notFound;
