const express = require("express");
const { notFound } = require("../middlewares");
const {
  UserController: { createUser, updateUser, deleteUser, getUsers, getUser },
} = require("../controllers");

const UserRouter = express.Router();

UserRouter.get("/", getUsers);
UserRouter.get("/:id", getUser, notFound);
UserRouter.post("/", createUser);
UserRouter.put("/:id", updateUser, notFound);
UserRouter.delete("/:id", deleteUser, notFound);

module.exports = UserRouter;
