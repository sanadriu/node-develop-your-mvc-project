const { Types } = require("mongoose");
const { ProductModel } = require("../models");

async function getProducts(req, res, next) {
  const num = 10;
  const {
    query: { page = 1 },
  } = req;

  try {
    if (isNaN(page) || page <= 0) {
      throw {
        message: "Wrong address index",
        status: 400,
      };
    }

    const result = await ProductModel.find({})
      .select("-__v -createdAt -updatedAt")
      .skip((page - 1) * num)
      .limit(num)
      .exec();

    res.status(200).send({
      success: true,
      data: result,
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
      throw {
        message: "Wrong product ID",
        status: 400,
      };
    }

    const result = await ProductModel.findById(idProduct)
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

async function createProducts(req, res, next) {
  const { body } = req;

  try {
    const result = await ProductModel.create(body);

    res.status(201).send({
      success: true,
      data: result,
    });
  } catch (erroror) {
    next(erroror);
  }
}

async function updateProduct(req, res, next) {
  const {
    params: { idProduct },
    body,
  } = req;

  try {
    if (!Types.ObjectId.isValid(idProduct)) {
      throw {
        message: "Wrong product ID",
        status: 400,
      };
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
      throw {
        message: "Wrong product ID",
        status: 400,
      };
    }

    const result = await ProductModel.findByIdAndDelete(idProduct)
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

module.exports = {
  getProducts: getProducts,
  createProducts: createProducts,
  getSingleProduct: getSingleProduct,
  updateProduct: updateProduct,
  deleteProduct: deleteProduct,
};
