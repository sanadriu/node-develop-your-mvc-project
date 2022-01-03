const express = require("express");

const {
  notFound,
  authMiddleware,
  accessMiddleware,
  filterMiddleware,
} = require("../middlewares");
const { UserController } = require("../controllers");

function allowUsers({ user: { role, id }, params: { idUser } }) {
  return (
    ["admin", "main-admin"].includes(role) ||
    (role === "customer" && id === idUser)
  );
}

function allowAdmin({ user: { role } }) {
  return ["admin", "main-admin"].includes(role);
}

function allowMain({ user: { role } }) {
  return role === "main-admin";
}

function denySelf({ user: { role, id }, params: { idUser } }) {
  return id !== idUser;
}

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
  notFound("User not found"),
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
  notFound("User not found"),
);

UserRouter.delete(
  "/:idUser",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowMain),
  filterMiddleware(denySelf),
  UserController.deleteUser,
  notFound("User not found"),
);

UserRouter.get(
  "/:idUser/addresses",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.getAddresses,
  notFound("User not found"),
);

UserRouter.get(
  "/:idUser/addresses/:idAddress",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.getSingleAddress,
  notFound("User or address not found"),
);

UserRouter.post(
  "/:idUser/addresses/",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.addAddress,
  notFound("User not found"),
);

UserRouter.patch(
  "/:idUser/addresses/:idAddress",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.updateAddress,
  notFound("User or address not found"),
);

UserRouter.delete(
  "/:idUser/addresses/:idAddress",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.deleteAddress,
  notFound("User or address not found"),
);

UserRouter.use("/:id/addresses", notFound());
UserRouter.use("/", notFound());

module.exports = UserRouter;
