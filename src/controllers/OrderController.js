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
      .select("-__v -updatedAt")
      .skip(start)
      .limit(limit)
      .lean()
      .exec();

    res.status(200).send({
      success: true,
      data: result,
      currentPage: page,
      lastPage: Math.floor(count - 1 / limit) + 1,
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
      .select("-__v -updatedAt")
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
    const result = await OrderModel.create({ ...body, idUser: req.user.id });

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
