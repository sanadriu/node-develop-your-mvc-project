const express = require("express");

const { notFound } = require("../middlewares");
const { ProductController } = require("../controllers");

const ProductsRouter = express.Router();

ProductsRouter.get("/", ProductController.getProducts);
ProductsRouter.post("/", ProductController.createProducts);
ProductsRouter.get("/:idProduct", ProductController.getSingleProduct, notFound);
ProductsRouter.patch("/:idProduct", ProductController.updateProduct, notFound);
ProductsRouter.delete("/:idProduct", ProductController.deleteProduct, notFound);

ProductsRouter.use("/", notFound);

module.exports = ProductsRouter;
