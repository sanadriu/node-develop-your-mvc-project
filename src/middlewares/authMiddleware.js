const { auth } = require("../services/firebase");

async function authMiddleware(req, res, next) {
  try {
    if (!req.headers.authorization?.startsWith("Bearer"))
      return res.status(401).send({
        success: false,
        message: "Not authorized",
      });

    const bearerToken = req.headers.authorization.split(" ")[1];
    const decodedToken = await auth.verifyIdToken(bearerToken);

    const { email, uid } = decodedToken;

    req.user = {
      email,
      uid,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
