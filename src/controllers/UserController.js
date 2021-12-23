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
  const { idUser } = req.params;

  try {
    const result = await UserModel.findOne({ _id: idUser })
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
  const { idUser } = req.params;
  const user = req.body;

  try {
    const result = await UserModel.findOneAndUpdate(
      { _id: idUser },
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

async function deleteSingleUser(req, res, next) {
  const { idUser } = req.params;

  try {
    const result = await UserModel.findOneAndDelete({ _id: idUser })
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

async function getDetails(req, res, next) {
  const { idUser } = req.params;

  try {
    const result = await UserModel.findOne({ _id: idUser })
      .select("-_id name surname phoneNumber phoneLocale")
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

async function updateDetails(req, res, next) {
  const { idUser } = req.params;
  const { name, surname, phoneNumber, phoneLocale } = req.body;

  try {
    const result = await UserModel.findOneAndUpdate(
      { _id: idUser },
      {
        $set: {
          name,
          surname,
          phoneNumber,
          phoneLocale,
        },
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

async function getAddresses(req, res, next) {
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

async function getSingleAddress(req, res, next) {
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

async function addAddress(req, res, next) {
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

    res.status(201).send({
      success: true,
      data: result,
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

async function deleteSingleAddress(req, res, next) {
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
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAddresses(req, res, next) {
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

async function signUp(req, res, next) {
  const user = req.body;

  try {
    const result = await UserModel.create({ ...user, role: customer });

    res.status(201).send({
      success: true,
      data: result._id,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getSingleUser,
  createUser,
  updateUser,
  deleteSingleUser,
  deleteUsers,
  getDetails,
  updateDetails,
  getAddresses,
  getSingleAddress,
  addAddress,
  updateAddress,
  deleteSingleAddress,
  deleteAddresses,
  signUp,
};
