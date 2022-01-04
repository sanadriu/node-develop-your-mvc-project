const { Types } = require("mongoose");
const { UserModel } = require("../models");

async function getUsers(req, res, next) {
  try {
    const result = await UserModel.find({})
      .select("-__v -createdAt -updatedAt")
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

async function getSingleUser(req, res, next) {
  const {
    params: { idUser },
  } = req;

  try {
    if (!Types.ObjectId.isValid(idUser)) {
      return res.status(400).send({
        success: false,
        message: "Wrong user ID",
      });
    }

    const result = await UserModel.findById(idUser)
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

async function createUser(req, res, next) {
  const { body } = req;

  try {
    const { __v, createdAt, updatedAt, ...result } = (
      await UserModel.create(body)
    ).toJSON();

    res.status(201).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  const {
    params: { idUser },
    body,
  } = req;

  try {
    if (!Types.ObjectId.isValid(idUser)) {
      return res.status(400).send({
        success: false,
        message: "Wrong user ID",
      });
    }

    const result = await UserModel.findByIdAndUpdate(
      idUser,
      {
        $set: body,
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
  const {
    params: { idUser },
  } = req;

  try {
    if (!Types.ObjectId.isValid(idUser)) {
      return res.status(400).send({
        success: false,
        message: "Wrong user ID",
      });
    }

    const result = await UserModel.findByIdAndDelete(idUser)
      .select("-__v -createdAt -updatedAt")
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

async function getAddresses(req, res, next) {
  const {
    params: { idUser },
  } = req;

  try {
    if (!Types.ObjectId.isValid(idUser)) {
      return res.status(400).send({
        success: false,
        message: "Wrong user ID",
      });
    }

    const result = await UserModel.findById(idUser)
      .select(`addresses`)
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

async function getSingleAddress(req, res, next) {
  const {
    params: { idUser, idAddress },
  } = req;

  try {
    if (!Types.ObjectId.isValid(idUser)) {
      return res.status(400).send({
        success: false,
        message: "Wrong user ID",
      });
    }

    if (isNaN(idAddress) || idAddress <= 0) {
      return res.status(400).send({
        success: false,
        message: "Wrong address index",
      });
    }

    const addressPath = `addresses.${idAddress - 1}`;

    const result = await UserModel.findOne({
      _id: idUser,
      [addressPath]: { $exists: true },
    })
      .select("addresses")
      .lean()
      .exec();

    if (!result) return next();

    res.status(200).send({
      success: true,
      data: result.addresses[idAddress - 1],
    });
  } catch (error) {
    next(error);
  }
}

async function addAddress(req, res, next) {
  const {
    params: { idUser },
    body,
  } = req;

  try {
    if (!Types.ObjectId.isValid(idUser)) {
      return res.status(400).send({
        success: false,
        message: "Wrong user ID",
      });
    }

    const result = await UserModel.findByIdAndUpdate(
      idUser,
      {
        $push: {
          addresses: body,
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
      data: result.addresses.pop(),
    });
  } catch (error) {
    next(error);
  }
}

async function updateAddress(req, res, next) {
  const {
    params: { idUser, idAddress },
    body,
  } = req;

  try {
    if (!Types.ObjectId.isValid(idUser)) {
      return res.status(400).send({
        success: false,
        message: "Wrong user ID",
      });
    }

    if (isNaN(idAddress) || idAddress <= 0) {
      return res.status(400).send({
        success: false,
        message: "Wrong address index",
      });
    }

    const addressPath = `addresses.${idAddress - 1}`;

    const result = await UserModel.findOneAndUpdate(
      { _id: idUser, [addressPath]: { $exists: true } },
      {
        $set: {
          [addressPath]: body,
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
      data: result.addresses[idAddress - 1],
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAddress(req, res, next) {
  const { idUser, idAddress } = req.params;

  try {
    if (!Types.ObjectId.isValid(idUser)) {
      return res.status(400).send({
        success: false,
        message: "Wrong user ID",
      });
    }

    if (isNaN(idAddress) || idAddress <= 0) {
      return res.status(400).send({
        success: false,
        message: "Wrong address index",
      });
    }

    const addressPath = `addresses.${idAddress - 1}`;

    const result = await UserModel.findOne({
      _id: idUser,
      [addressPath]: { $exists: true },
    })
      .lean()
      .exec();

    if (!result) return next();

    UserModel.findByIdAndUpdate(idUser, {
      $unset: {
        [addressPath]: "",
      },
    });

    UserModel.findByIdAndUpdate(idUser, {
      $pull: {
        addresses: null,
      },
    });

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
  getAddresses,
  getSingleAddress,
  addAddress,
  updateAddress,
  deleteAddress,
  signUp,
};
