const { Types } = require("mongoose");
const { UserModel, OrderModel } = require("../models");
const auth = require("../services/auth");

async function getUsers(req, res, next) {
  const {
    query: { page = 1 },
  } = req;

  const limit = 10;
  const start = (page - 1) * limit;

  try {
    if (isNaN(page) || page <= 0) {
      return res.status(400).send({
        success: false,
        message: "Wrong page number",
      });
    }

    const count = await UserModel.countDocuments();

    if (start > count) return next();

    const result = await UserModel.find({})
      .select("-createdAt -updatedAt")
      .skip(start)
      .limit(limit)
      .lean()
      .exec();

    res.status(200).send({
      success: true,
      data: result,
      currentPage: Number(page),
      lastPage: Math.floor(count / limit) + (count % limit ? 1 : 0),
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

    const result = await UserModel.findById(idUser).select("-createdAt -updatedAt").lean().exec();

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
  const {
    body: { password, email, ...body },
  } = req;

  try {
    if (await UserModel.exists({ email })) {
      return res.status(400).send({
        success: false,
        message: "Email account is already used",
      });
    }

    const { uid } = await auth.createUser({
      email,
      displayName: email,
      password,
    });

    const { createdAt, updatedAt, ...result } = (
      await UserModel.create({ uid, email, ...body })
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
    body: { uid, email, password, ...body },
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
      .select("-createdAt -updatedAt")
      .lean()
      .exec();

    if (!result) return next();

    if (password) await auth.updateUser(result.uid, { password });

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
      .select("-createdAt -updatedAt")
      .lean()
      .exec();

    if (!result) return next();

    await auth.deleteUser(result.uid);

    res.status(200).send({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrders(req, res, next) {
  const {
    params: { idUser },
    query: { page = 1 },
  } = req;

  const limit = 10;
  const start = (page - 1) * limit;

  try {
    if (isNaN(page) || page <= 0) {
      return res.status(400).send({
        success: false,
        message: "Wrong page number",
      });
    }

    if (!Types.ObjectId.isValid(idUser)) {
      return res.status(400).send({
        success: false,
        message: "Wrong user ID",
      });
    }

    const exists = await UserModel.findById(idUser).lean().exec();

    if (!exists) return next();

    const count = await OrderModel.countDocuments({ idUser });

    if (start > count) return next();

    const result = await OrderModel.find({ user: idUser })
      .select("-updatedAt -user")
      .populate("products.product", "title description images")
      .skip(start)
      .limit(limit)
      .lean()
      .exec();

    res.status(200).send({
      success: true,
      data: result,
      currentPage: Number(page),
      lastPage: Math.floor(count / limit) + (count % limit ? 1 : 0),
    });
  } catch (error) {
    next(error);
  }
}

async function getSingleOrder(req, res, next) {
  const {
    params: { idUser, numOrder },
  } = req;

  try {
    if (!Types.ObjectId.isValid(idUser)) {
      return res.status(400).send({
        success: false,
        message: "Wrong user ID",
      });
    }

    if (isNaN(numOrder) || numOrder <= 0) {
      return res.status(400).send({
        success: false,
        message: "Wrong order number",
      });
    }

    const exists = await UserModel.findById(idUser).lean().exec();

    if (!exists) return next();

    const result = await OrderModel.findOne({ user: idUser })
      .skip(numOrder - 1)
      .select("-updatedAt -user")
      .populate({
        path: "products",
        populate: { path: "product", select: "title description images" },
      })
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

async function sync(req, res, next) {
  const { uid } = req.user;

  try {
    const result = await UserModel.findOne({ uid })
      .select("role email firstname lastname")
      .lean()
      .exec();

    if (!result) throw new Error("User exists in Firebase Auth Service but is not found in DB");

    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  const {
    body: { password, email, ...body },
  } = req;

  try {
    if (await UserModel.exists({ email })) {
      return res.status(400).send({
        success: false,
        message: "Email account is already used",
      });
    }

    const { uid } = await auth.createUser({
      email,
      displayName: email,
      password,
    });

    await UserModel.create({ uid, email, role: "customer", ...body });

    res.status(201).send({
      success: true,
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
  deleteUser,
  getOrders,
  getSingleOrder,
  sync,
  register,
};
