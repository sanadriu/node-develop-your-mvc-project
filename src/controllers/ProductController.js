const { ProductModel } = require("../models");

async function getProducts(req, res, next) {
  try {
    const result = await ProductModel.find({})
      .select("-__v -createdAt -updatedAt")
      .lean()
      .exec();

    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getSingleProduct(req, res, next) {
  const { productId } = req.params;

  try {
    const result = await ProductModel.find({ _id: productId })
      .select("-__v -createdAt -updatedAt")
      .lean()
      .exec();

    if (!result) return next();

    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function createProducts(req, res, next) {
  try {
    const product = req.body;
    const result = await ProductModel.create(product);

    res.status(201).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  const { productId } = req.params;
  const data = req.body;

  try {
    const result = await ProductModel.findByIdAndUpdate(
      { _id: productId },
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

    if (!result) return next();

    res.status(202).send({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  const { productId } = req.params;

  try {
    const result = await ProductModel.findByIdAndDelete({ _id: productId })
      .select("-__v -createdAt -updatedAt")
      .lean()
      .exec();

    if (!result) return next();

    res.status(200).send({
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts: getProducts,
  createProducts: createProducts,
  getSingleProduct: getSingleProduct,
  updateProduct: updateProduct,
  deleteProduct: deleteProduct,
};
