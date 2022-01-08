const { Types } = require("mongoose");
const { OrderModel } = require("../models");

async function getOrders(req, res, next) {
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

    const count = await OrderModel.countDocuments();

    if (start > count) return next();

    const result = await OrderModel.find()
      .select("-updatedAt")
      .populate("products.product", "title description images")
      .populate("user", "firstname lastname email")
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
    params: { idOrder },
  } = req;

  try {
    if (!Types.ObjectId.isValid(idOrder)) {
      return res.status(400).send({
        success: false,
        message: "Wrong order ID",
      });
    }

    const result = await OrderModel.findById(idOrder)
      .select("-updatedAt")
      .populate("products.product", "title description images")
      .populate("user", "firstname lastname email")
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

async function createOrder(req, res, next) {
  const { body } = req;

  try {
    if (!req.user?.id) {
      throw new Error(
        "User ID must be embedded in the request. Request must be processed previously by 'AuthMiddleware' and 'AccessMiddleware'.",
      );
    }

    const { updatedAt, ...result } = (
      await OrderModel.create({
        ...body,
        idUser: req.user.id,
      })
    ).toJSON();

    res.status(201).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOrders,
  getSingleOrder,
  createOrder,
};
