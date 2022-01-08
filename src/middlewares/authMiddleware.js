const { auth } = require("../services/firebase");

async function authMiddleware(req, res, next) {
  try {
    if (!req.headers.authorization?.startsWith("Bearer "))
      return res.status(401).send({
        success: false,
        message: "Not authorized",
      });

    const authToken = req.headers.authorization.split(" ")[1];
    const authUser = await auth.verifyIdToken(authToken);

    const { uid, email } = authUser;

    req.user = {
      ...req.user,
      uid,
      email,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
