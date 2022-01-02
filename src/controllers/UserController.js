const { Types } = require("mongoose");
const { UserModel } = require("../models");

async function getUsers(req, res, next) {
  try {
    const result = await UserModel.find({}).select("-__v -createdAt -updatedAt").lean().exec();

    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getSingleUser(req, res, next) {
  const { idUser } = req.params;

  try {
    if (!Types.ObjectId.isValid(idUser)) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const result = await UserModel.findById(idUser)
      .select("-__v -createdAt -updatedAt")
      .lean()
      .exec();

    if (result) {
      res.status(200).send({
        success: true,
        data: result,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  const user = req.body;

  try {
    const { __v, createdAt, updatedAt, ...result } = (await UserModel.create(user)).toJSON();

    res.status(201).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  const { idUser } = req.params;
  const user = req.body;

  try {
    if (!Types.ObjectId.isValid(idUser)) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const result = await UserModel.findByIdAndUpdate(
      idUser,
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

    if (result) {
      res.status(200).send({
        success: true,
        data: result,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  const { idUser } = req.params;

  try {
    if (!Types.ObjectId.isValid(idUser)) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const result = await UserModel.findByIdAndDelete(idUser)
      .select("-__v -createdAt -updatedAt")
      .lean()
      .exec();

    if (result) {
      res.status(200).send({
        success: true,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
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

async function getAddresses(req, res, next) {
  const { idUser } = req.params;

  try {
    const result = await UserModel.findById(idUser).select(`addresses`).lean().exec();

    if (result) {
      res.status(200).send({
        success: true,
        data: result,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    next(error);
  }
}

async function getSingleAddress(req, res, next) {
  const { idUser, idAddress } = req.params;

  try {
    const result = await UserModel.findById({
      _id: idUser,
      "addresses._id": idAddress,
    })
      .select("addresses")
      .lean()
      .exec();

    if (!result) return next();

    res.status(200).send({
      success: true,
      data: result.addresses.find((address) => address._id == idAddress),
    });
  } catch (error) {
    next(error);
  }
}

async function addAddress(req, res, next) {
  const { idUser } = req.params;
  const address = req.body;

  try {
    const result = await UserModel.findByIdAndUpdate(
      idUser,
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
      .select("addresses")
      .lean()
      .exec();

    if (!result) return next();

    res.status(201).send({
      success: true,
      data: result.addresses.slice(-1)._id,
    });
  } catch (error) {
    next(error);
  }
}

async function updateAddress(req, res, next) {
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
      .select("addresses")
      .lean()
      .exec();

    if (!result) return next();

    res.status(200).send({
      success: true,
      data: result.addresses.find((address) => address._id == idAddress),
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAddress(req, res, next) {
  const { idUser, idAddress } = req.params;

  try {
    const result = await UserModel.findByIdAndUpdate(
      idUser,
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
      .select("addresses")
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

async function signUp(req, res, next) {
  const { uid, email } = req.body;

  try {
    const user = await UserModel.findOne({ uid, email }).lean().exec();

    console.log(user);

    if (user) {
      res.status(200).send({
        success: true,
        message: "User already existed",
        data: { _id: user._id },
      });
    } else {
      const newUser = await UserModel.create({ uid, email, role: "customer" });

      res.status(201).send({
        success: true,
        message: "User account has been created successfully.",
        data: { _id: newUser._id },
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
  deleteUsers,
  getAddresses,
  getSingleAddress,
  addAddress,
  updateAddress,
  deleteAddress,
  signUp,
};
