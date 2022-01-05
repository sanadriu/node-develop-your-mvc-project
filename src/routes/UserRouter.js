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
  "/:idUser/addresses",
  authMiddleware,
  accessMiddleware,
  filterSomeMiddleware([allowAdmin, allowSelf]),
  UserController.getAddresses,
  notFoundHandler,
);

UserRouter.get(
  "/:idUser/addresses/:numAddress",
  authMiddleware,
  accessMiddleware,
  filterSomeMiddleware([allowAdmin, allowSelf]),
  UserController.getSingleAddress,
  notFoundHandler,
);

UserRouter.post(
  "/:idUser/addresses/",
  authMiddleware,
  accessMiddleware,
  filterSomeMiddleware([allowAdmin, allowSelf]),
  UserController.addAddress,
  notFoundHandler,
);

UserRouter.patch(
  "/:idUser/addresses/:numAddress",
  authMiddleware,
  accessMiddleware,
  filterSomeMiddleware([allowAdmin, allowSelf]),
  UserController.updateAddress,
  notFoundHandler,
);

UserRouter.delete(
  "/:idUser/addresses/:numAddress",
  authMiddleware,
  accessMiddleware,
  filterSomeMiddleware([allowAdmin, allowSelf]),
  UserController.deleteAddress,
  notFoundHandler,
);

UserRouter.get(
  "/:idUser/orders",
  authMiddleware,
  accessMiddleware,
  filterSomeMiddleware([allowAdmin, allowSelf]),
  UserController.deleteAddress,
  notFoundHandler,
);

UserRouter.get(
  "/:idUser/orders/:numOrder",
  authMiddleware,
  accessMiddleware,
  filterSomeMiddleware([allowAdmin, allowSelf]),
  UserController.deleteAddress,
  notFoundHandler,
);

UserRouter.post("/sign-up", UserController.signUp);

UserRouter.use("/:id/addresses", notFoundHandler);
UserRouter.use("/", notFoundHandler);

module.exports = UserRouter;
