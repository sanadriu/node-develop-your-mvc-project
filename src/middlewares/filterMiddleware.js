function filterMiddleware(callback, message = "Forbidden") {
  return function (req, res, next) {
    try {
      if (!callback(req))
        return res.status(403).send({
          success: false,
          message,
        });

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = filterMiddleware;
