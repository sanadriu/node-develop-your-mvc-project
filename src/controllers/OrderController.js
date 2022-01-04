const { Types } = require("mongoose");
const { OrderModel } = require("../models");

async function getOrders(req, res, next) {
  const {
    query: { page = 1, idCustomer = null },
  } = req;

  const limit = 10;
  const start = (page - 1) * limit;

  try {
    if (isNaN(page) || page <= 0) {
      throw {
        message: "Wrong page number",
        status: 400,
      };
    }

    if (idCustomer !== null && !Types.ObjectId.isValid(idCustomer)) {
      throw {
        message: "Wrong customer ID",
        status: 400,
      };
    }

    const count = await OrderModel.countDocuments(
      idCustomer && { customer: idCustomer },
    );

    if (start > count) return next();

    const result = await OrderModel.find(idCustomer && { customer: idCustomer })
      .select("-__v updatedAt")
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
      throw {
        message: "Wrong order ID",
        status: 400,
      };
    }

    const result = await OrderModel.findById(idOrder)
      .select("-__v updatedAt")
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
      throw {
        message: "Forbidden: User must be logged in to specify the customer",
        status: 403,
      };
    }

    const result = await OrderModel.create({ ...body, customer: req.user.id });

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
