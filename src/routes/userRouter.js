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
  },
} = require("../controllers");

const UserRouter = express.Router();

UserRouter.get("/", getUsers);
UserRouter.get("/:id", getUser, notFound);
UserRouter.post("/", createUser);
UserRouter.put("/:id", updateUser, notFound);
UserRouter.delete("/:id", deleteUser, notFound);
UserRouter.delete("/", deleteUsers);

UserRouter.get("/:id/addresses", getUserAddresses);
UserRouter.get("/:id/addresses/:index", getUserAddress);
UserRouter.post("/:id/addresses/", addUserAddress);
UserRouter.put("/:id/addresses/:index", updateUserAddress);
UserRouter.delete("/:id/addresses/:index", deleteUserAddress);

UserRouter.use("/:id/addresses", notFound);
UserRouter.use("/", notFound);

module.exports = UserRouter;
