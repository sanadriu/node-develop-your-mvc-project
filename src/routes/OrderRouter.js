const express = require("express");

const { OrderController } = require("../controllers");
const { allowUsers } = require("./filters");
const {
  notFoundHandler,
  authMiddleware,
  accessMiddleware,
  filterMiddleware,
} = require("../middlewares");

const OrderRouter = express.Router();

OrderRouter.get(
  "/",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  OrderController.getOrders,
  notFoundHandler,
);

OrderRouter.get(
  "/:idUser",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  OrderController.getSingleOrder,
  notFoundHandler,
);

OrderRouter.post(
  "/",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  OrderController.createOrder,
);

OrderRouter.use("/", notFoundHandler);

OrderRouter.module.exports = OrderRouter;
