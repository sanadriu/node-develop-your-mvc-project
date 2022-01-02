const { Types } = require("mongoose");
const { ProductModel } = require("../models");

async function getProducts(req, res, next) {
  try {
    const result = await ProductModel.find({}).select("-__v -createdAt -updatedAt").exec();

    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getSingleProduct(req, res, next) {
  const { idProduct } = req.params;

  try {
    if (!Types.ObjectId.isValid(idProduct)) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    const result = await ProductModel.findOne({ _id: idProduct })
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
        message: "Product not found",
      });
    }
  } catch (error) {
    next(error);
  }
}

async function createProducts(req, res, next) {
  const product = req.body;

  try {
    const result = await ProductModel.create(product);

    res.status(201).send({
      success: true,
      data: result,
    });
  } catch (erroror) {
    next(erroror);
  }
}

async function updateProduct(req, res, next) {
  const { idProduct } = req.params;
  const product = req.body;

  try {
    if (!Types.ObjectId.isValid(idProduct)) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    const result = await ProductModel.findByIdAndUpdate(
      { _id: idProduct },
      {
        ...data,
      },
      {
        new: true,
        runValidators: true,
      },
    )
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
        message: "Product not found",
      });
    }
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  const { idProduct } = req.params;

  try {
    if (!Types.ObjectId.isValid(idProduct)) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    const result = await ProductModel.findByIdAndDelete({ _id: idProduct })
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
        message: "Product not found",
      });
    }
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
