const { UserModel } = require("../models");

async function getUsers(req, res, next) {
  try {
    const result = await UserModel.find({})
      .select("-__v -createdAt -updatedAt")
      .lean()
      .exec();

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
      .select("-__v -createdAt -updatedAt")
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
  const user = req.body;

  try {
    const result = await UserModel.create(user);

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
  const user = req.body;

  try {
    const result = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        $set: user,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .select("-__v -createdAt -updatedAt")
      .lean()
      .exec();

    if (!result) return next();

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
    const result = await UserModel.findOneAndDelete({ _id: id })
      .select("-__v -createdAt -updatedAt")
      .lean()
      .exec();

    if (!result) return next();

    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUsers(req, res, next) {
  try {
    const result = await UserModel.deleteMany({});

    res.status(200).send({
      success: true,
      data: {
        count: result.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getUserAddresses(req, res, next) {
  const { idUser } = req.params;

  try {
    const result = await UserModel.findOne({ _id: idUser })
      .select(`-_id addresses`)
      .lean()
      .exec();

    if (!result) return next();

    const { addresses } = result;

    res.status(200).send({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
}

async function getUserAddress(req, res, next) {
  const { idUser, idAddress } = req.params;

  try {
    const result = await UserModel.findOne({ _id: idUser })
      .select("-_id addresses")
      .lean()
      .exec();

    if (!result) return next();

    const address = result.addresses.find(
      (address) => address._id == idAddress,
    );

    if (!address) return next();

    res.status(200).send({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
}

async function addUserAddress(req, res, next) {
  const { idUser } = req.params;
  const address = req.body;

  try {
    const result = await UserModel.findOneAndUpdate(
      { _id: idUser },
      {
        $push: {
          addresses: address,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .select("-_id addresses")
      .lean()
      .exec();

    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function updateUserAddress(req, res, next) {
  const { idUser, idAddress } = req.params;
  const address = req.body;

  try {
    const result = await UserModel.findOneAndUpdate(
      { _id: idUser, "addresses._id": idAddress },
      {
        $set: {
          "addresses.$": address,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .select("-_id addresses")
      .lean()
      .exec();

    if (!result) return next();

    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUserAddress(req, res, next) {
  const { idUser, idAddress } = req.params;

  try {
    const result = await UserModel.findOneAndUpdate(
      { _id: idUser },
      {
        $pull: {
          addresses: { _id: idAddress },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .select("-_id addresses")
      .lean()
      .exec();

    if (!result) return next();

    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUserAddresses(req, res, next) {
  const { id } = req.params;

  try {
    const result = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          addresses: [],
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .select("-_id addresses")
      .lean()
      .exec();

    if (!result) return next();

    res.status(200).send({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deleteUsers,
  getUserAddresses,
  getUserAddress,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  deleteUserAddresses,
};
