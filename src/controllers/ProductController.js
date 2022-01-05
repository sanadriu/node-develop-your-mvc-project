const { Types } = require("mongoose");
const { ProductModel } = require("../models");

async function getProducts(req, res, next) {
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

    const count = await ProductModel.countDocuments();

    if (start > count) return next();

    const result = await ProductModel.find({})
      .select("-createdAt -updatedAt")
      .skip(start)
      .limit(limit)
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

async function getSingleProduct(req, res, next) {
  const {
    params: { idProduct },
  } = req;

  try {
    if (!Types.ObjectId.isValid(idProduct)) {
      return res.status(400).send({
        success: false,
        message: "Wrong product ID",
      });
    }

    const result = await ProductModel.findById(idProduct)
      .select("-createdAt -updatedAt")
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

async function createProduct(req, res, next) {
  const { body } = req;

  try {
    const { createdAt, updatedAt, ...result } = (
      await ProductModel.create(body)
    ).toJSON();

    res.status(201).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  const {
    params: { idProduct },
    body,
  } = req;

  try {
    if (!Types.ObjectId.isValid(idProduct)) {
      return res.status(400).send({
        success: false,
        message: "Wrong product ID",
      });
    }

    const result = await ProductModel.findByIdAndUpdate(
      idProduct,
      {
        $set: body,
      },
      {
        new: true,
        runValidators: true,
      },
    )
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

async function deleteProduct(req, res, next) {
  const {
    params: { idProduct },
  } = req;

  try {
    if (!Types.ObjectId.isValid(idProduct)) {
      return res.status(400).send({
        success: false,
        message: "Wrong product ID",
      });
    }

    const result = await ProductModel.findByIdAndDelete(idProduct)
      .select("-createdAt -updatedAt")
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
  getProducts: getProducts,
  createProduct: createProduct,
  getSingleProduct: getSingleProduct,
  updateProduct: updateProduct,
  deleteProduct: deleteProduct,
};
