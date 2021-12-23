const Router = require("express").Router;

const productsController = require("../controllers/products-controller");

const productsRouter = Router();

productsRouter.get("/", productsController.getProducts);
productsRouter.post("/", productsController.createProducts);
productsRouter.get("/:productId", productsController.getSingleProduct);
productsRouter.patch("/:productId", productsController.updateProduct);
productsRouter.delete("/:productId", productsController.deleteProduct);

module.exports = productsRouter
