function error(err, req, res, next) {
  res.status(500).send({
    success: false,
    message: err.message,
    code: err.code,
  });
}

module.exports = error;
