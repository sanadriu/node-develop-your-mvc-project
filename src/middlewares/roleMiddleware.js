const { UserModel } = require("../models");

function roleMiddleware(roleList) {
  return async function (req, res, next) {
    try {
      const { uid } = req.user;

      const result = UserModel.findOne({ uid })
        .select("-_id role")
        .lean()
        .exec();

      if (!result)
        return res.status(404).send({
          success: false,
          message: "Unregistered user",
        });

      if (!roleList.include(result.role))
        return res.status(403).send({
          success: false,
          message: "Forbidden",
        });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = roleMiddleware;
