async function authMiddleware(req, res, next) {
  try {
    if (!req.headers.authorization?.startsWith("Bearer"))
      return res.status(401).send({
        success: false,
        message: "Not authorized",
      });

    // IMPORTANT: The mocked version of the Auth Middleware uses the UID value as a token to grant authorization, instead of a JWT.
    // Auth method is still 'Bearer' despite it does not accomplish the standards.

    const uid = req.headers.authorization.split(" ")[1];

    req.user = {
      ...req.user,
      uid,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
