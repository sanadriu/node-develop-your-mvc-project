const Router = require("express").Router;

const productsController = require("../controllers/products-controller");

const productsRouter = Router();
productsRouter.get("/products", productsController.getProducts);
productsRouter.post("/products", productsController.createProducts);
