const { UserModel } = require("../models");

async function getUsers(req, res, next) {
  try {
    const result = await UserModel.find({}).select("-__v").lean().exec();

    res.status(201).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  const { id } = req.params;

  try {
    const result = await UserModel.findOne({ _id: id })
      .select("-__v")
      .lean()
      .exec();

    if (!result) return next();

    res.status(201).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  const { body } = req;

  try {
    const result = await UserModel.create(body);

    res.status(201).send({
      success: true,
      data: result._id,
    });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  const { id } = req.params;
  const { body } = req;

  try {
    const result = await UserModel.updateOne({ _id: id }, body, {
      new: true,
      runValidators: true,
    });

    if (!result.updatedCount) return next();

    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  const { id } = req.params;

  try {
    const result = await UserModel.deleteOne({ _id: id });

    if (!result.deletedCount) return next();

    res.status(200).send({
      success: true,
      data: result._id,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  getUser,
};
