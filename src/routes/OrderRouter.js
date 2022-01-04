const express = require("express");

const { OrderController } = require("../controllers");
const { allowAdmin, allowSelfInQuery, allowUsers } = require("./filters");
const {
  notFoundHandler,
  authMiddleware,
  accessMiddleware,
  filterMiddleware,
  filterSomeMiddleware,
} = require("../middlewares");

const OrderRouter = express.Router();

OrderRouter.get(
  "/",
  authMiddleware,
  accessMiddleware,
  filterSomeMiddleware([allowAdmin, allowSelfInQuery]),
  OrderController.getOrders,
  notFoundHandler,
);

OrderRouter.get(
  "/:idOrder",
  authMiddleware,
  accessMiddleware,
  filterSomeMiddleware([allowAdmin, allowSelfInQuery]),
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
