const express = require("express");

const { OrderController } = require("../controllers");
const { allowAdmin, allowUsers } = require("./filters");
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
  filterMiddleware(allowAdmin),
  OrderController.getOrders,
  notFoundHandler,
);

OrderRouter.get(
  "/:idOrder",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowAdmin),
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

OrderRouter.use("*", notFoundHandler);

module.exports = OrderRouter;
