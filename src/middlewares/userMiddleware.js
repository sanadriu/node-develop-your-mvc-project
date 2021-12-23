const { UserModel } = require("../models");

async function userMiddleware(req, res, next) {
  try {
    const { uid } = req.user;

    const result = UserModel.findOne({ uid }).select("_id role").lean().exec();

    if (!result)
      return res.status(403).send({
        success: false,
        message: "Forbidden: Unregistered user",
      });

    req.user = {
      ...req.user,
      ...result,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = userMiddleware;
