const express = require("express");

const { ProductController } = require("../controllers");
const { allowAdmin } = require("./filters");
const {
  notFoundHandler,
  authMiddleware,
  accessMiddleware,
  filterMiddleware,
} = require("../middlewares");

const ProductsRouter = express.Router();

ProductsRouter.get("/", ProductController.getProducts);

ProductsRouter.get(
  "/:idProduct",
  ProductController.getSingleProduct,
  notFoundHandler,
);

ProductsRouter.post(
  "/",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowAdmin),
  ProductController.createProduct,
);

ProductsRouter.patch(
  "/:idProduct",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowAdmin),
  ProductController.updateProduct,
  notFoundHandler,
);

ProductsRouter.delete(
  "/:idProduct",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowAdmin),
  ProductController.deleteProduct,
  notFoundHandler,
);

ProductsRouter.use("/", notFoundHandler);

module.exports = ProductsRouter;
