const { UserModel } = require("../models");

async function accessMiddleware(req, res, next) {
  try {
    if (!req.user?.uid) {
      throw new Error(
        "User UID must be embedded in the request. Request must be processed previously by 'AuthMiddleware'.",
      );
    }

    const { uid } = req.user;

    const result = await UserModel.findOne({ uid })
      .select("_id role")
      .lean()
      .exec();

    if (!result)
      return res.status(401).send({
        success: false,
        message: "Not authorized",
      });

    const { role, _id: id } = result;

    req.user = {
      ...req.user,
      id: id.toString(),
      role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = accessMiddleware;
