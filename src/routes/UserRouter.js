const express = require("express");

const { UserController } = require("../controllers");
const { allowAdmin, allowMain, denySelf, allowSelf } = require("./filters");
const {
  notFoundHandler,
  authMiddleware,
  accessMiddleware,
  filterMiddleware,
  filterEveryMiddleware,
  filterSomeMiddleware,
} = require("../middlewares");

const UserRouter = express.Router();

UserRouter.get("/sync", authMiddleware, accessMiddleware, UserController.sync);

UserRouter.post("/register", UserController.register);

UserRouter.get(
  "/",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowAdmin),
  UserController.getUsers,
);

UserRouter.get(
  "/:idUser",
  authMiddleware,
  accessMiddleware,
  filterSomeMiddleware([allowAdmin, allowSelf]),
  UserController.getSingleUser,
  notFoundHandler,
);

UserRouter.post(
  "/",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowMain),
  UserController.createUser,
);

UserRouter.patch(
  "/:idUser",
  authMiddleware,
  accessMiddleware,
  filterSomeMiddleware([allowAdmin, allowSelf]),
  UserController.updateUser,
  notFoundHandler,
);

UserRouter.delete(
  "/:idUser",
  authMiddleware,
  accessMiddleware,
  filterEveryMiddleware([allowMain, denySelf]),
  UserController.deleteUser,
  notFoundHandler,
);

UserRouter.get(
  "/:idUser/orders",
  authMiddleware,
  accessMiddleware,
  filterSomeMiddleware([allowAdmin, allowSelf]),
  UserController.getOrders,
  notFoundHandler,
);

UserRouter.get(
  "/:idUser/orders/:numOrder",
  authMiddleware,
  accessMiddleware,
  filterSomeMiddleware([allowAdmin, allowSelf]),
  UserController.getSingleOrder,
  notFoundHandler,
);

UserRouter.use("*", notFoundHandler);

module.exports = UserRouter;
