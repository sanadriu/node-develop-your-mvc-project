const express = require("express");

const { notFound } = require("../middlewares");
const { ProductController } = require("../controllers");

const ProductsRouter = express.Router();

ProductsRouter.get("/", ProductController.getProducts);
ProductsRouter.post("/", ProductController.createProducts);
ProductsRouter.get("/:productId", ProductController.getSingleProduct, notFound);
ProductsRouter.patch("/:productId", ProductController.updateProduct, notFound);
ProductsRouter.delete("/:productId", ProductController.deleteProduct, notFound);

ProductsRouter.use("/", notFound);

module.exports = ProductsRouter;
