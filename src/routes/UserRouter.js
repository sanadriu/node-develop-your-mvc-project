const express = require("express");

const { UserController } = require("../controllers");
const { allowUsers, allowAdmin, allowMain, denySelf } = require("./filters");
const {
  notFoundHandler,
  authMiddleware,
  accessMiddleware,
  filterMiddleware,
} = require("../middlewares");

const UserRouter = express.Router();

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
  filterMiddleware(allowUsers),
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

UserRouter.post("/sign-up", UserController.signUp);

UserRouter.patch(
  "/:idUser",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.updateUser,
  notFoundHandler,
);

UserRouter.delete(
  "/:idUser",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowMain),
  filterMiddleware(denySelf),
  UserController.deleteUser,
  notFoundHandler,
);

UserRouter.get(
  "/:idUser/addresses",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.getAddresses,
  notFoundHandler,
);

UserRouter.get(
  "/:idUser/addresses/:idAddress",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.getSingleAddress,
  notFoundHandler,
);

UserRouter.post(
  "/:idUser/addresses/",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.addAddress,
  notFoundHandler,
);

UserRouter.patch(
  "/:idUser/addresses/:idAddress",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.updateAddress,
  notFoundHandler,
);

UserRouter.delete(
  "/:idUser/addresses/:idAddress",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.deleteAddress,
  notFoundHandler,
);

UserRouter.use("/:id/addresses", notFoundHandler);
UserRouter.use("/", notFoundHandler);

module.exports = UserRouter;
