function filterMiddleware(callback) {
  return async function (req, res, next) {
    try {
      if (!callback(req))
        return res.status(403).send({
          success: false,
          message: "Forbidden",
        });

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = filterMiddleware;
