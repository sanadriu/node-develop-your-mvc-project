const { logger } = require("../config/config");
const { auth } = require("../firebase/firebase");

async function authMiddleware(req, res, next) {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      const bearerToken = req.headers.authorization.split(" ")[1];
      const decodedToken = await auth.verifyIdToken(bearerToken);

      const { email, uid } = decodedToken;

      req.user = {
        email,
        uid,
      };

      next();
    } else {
      res.status(401).send({
        data: [],
        error: "Unauthorized",
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
