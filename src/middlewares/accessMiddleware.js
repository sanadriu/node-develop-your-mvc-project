const { UserModel } = require("../models");

async function accessMiddleware(req, res, next) {
  try {
    if (!req.user?.uid) {
      return res.status(403).send({
        success: false,
        message: "Forbidden: Authentication required",
      });
    }

    const { uid } = req.user;

    const result = await UserModel.findOne({ uid }).select("_id role").lean().exec();

    if (!result)
      return res.status(403).send({
        success: false,
        message: "Forbidden: Unregistered user",
      });

    const { role, _id } = result;

    req.user = {
      ...req.user,
      id: _id.toString(),
      role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = accessMiddleware;
