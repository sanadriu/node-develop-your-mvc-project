const express = require("express");

const { notFound } = require("../middlewares");
const { UserController } = require("../controllers");

const UserRouter = express.Router();

UserRouter.get("/", UserController.getUsers);
UserRouter.get("/:idUser", UserController.getSingleUser, notFound);
UserRouter.post("/", UserController.createUser);
UserRouter.put("/:idUser", UserController.updateUser, notFound);
UserRouter.delete("/:idUser", UserController.deleteUser, notFound);
UserRouter.delete("/", UserController.deleteUsers);

UserRouter.get("/:idUser/addresses", UserController.getAddresses);
UserRouter.get(
  "/:idUser/addresses/:idAddress",
  UserController.getSingleAddress,
);
UserRouter.post("/:idUser/addresses/", UserController.addAddress);
UserRouter.put("/:idUser/addresses/:idAddress", UserController.updateAddress);
UserRouter.delete(
  "/:idUser/addresses/:idAddress",
  UserController.deleteAddress,
);
UserRouter.delete("/:id/addresses/", UserController.deleteAddresses);

UserRouter.use("/:id/addresses", notFound);
UserRouter.use("/", notFound);

module.exports = UserRouter;
