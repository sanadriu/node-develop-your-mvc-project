function filterSomeMiddleware(callbackList, message = "Forbidden") {
  return function (req, res, next) {
    try {
      const allow = callbackList
        .map((callback) => callback(req))
        .some((value) => value);

      if (!allow)
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

module.exports = filterSomeMiddleware;
