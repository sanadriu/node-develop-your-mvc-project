const { UserModel } = require("../models");

async function accessMiddleware(req, res, next) {
  try {
    if (!req.user?.uid) {
      return res.status(403).send({
        success: false,
        message: "Forbidden: User UID token not found in the request",
      });
    }

    const { uid } = req.user;

    const result = await UserModel.findOne({ uid })
      .select("_id role")
      .lean()
      .exec();

    if (!result)
      return res.status(403).send({
        success: false,
        message: "Forbidden: Unregistered user",
      });

    const { role, _id: id } = result;

    req.user = {
      ...req?.user,
      id,
      role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = accessMiddleware;
