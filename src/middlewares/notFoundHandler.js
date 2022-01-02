function notFound(message = "Resource not found") {
  return function (req, res, next) {
    res.status(404).send({
      success: false,
      message,
    });
  };
}

module.exports = notFound;
