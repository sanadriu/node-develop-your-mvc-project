const express = require("express");
const { notFound } = require("../middlewares");
const {
  UserController: {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    deleteUsers,
    getUserAddresses,
    getUserAddress,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    deleteUserAddresses,
  },
} = require("../controllers");

const UserRouter = express.Router();

UserRouter.get("/", getUsers);
UserRouter.get("/:id", getUser, notFound);
UserRouter.post("/", createUser);
UserRouter.put("/:id", updateUser, notFound);
UserRouter.delete("/:id", deleteUser, notFound);
UserRouter.delete("/", deleteUsers);

UserRouter.get("/:idUser/addresses", getUserAddresses);
UserRouter.get("/:idUser/addresses/:idAddress", getUserAddress);
UserRouter.post("/:idUser/addresses/", addUserAddress);
UserRouter.put("/:idUser/addresses/:idAddress", updateUserAddress);
UserRouter.delete("/:idUser/addresses/:idAddress", deleteUserAddress);
UserRouter.delete("/:id/addresses/", deleteUserAddresses);

UserRouter.use("/:id/addresses", notFound);
UserRouter.use("/", notFound);

module.exports = UserRouter;
