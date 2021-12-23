const express = require("express");

const {
  notFound,
  authMiddleware,
  userMiddleware,
  filterMiddleware,
} = require("../middlewares");
const { UserController } = require("../controllers");

function allowUsers({ user: { role, _id }, params: { idUser } }) {
  return (
    ["admin", "full-admin"].includes(role) ||
    (role === "customer" && _id === idUser)
  );
}

function allowAdmins({ user: { role } }) {
  return ["admin", "full-admin"].includes(role);
}

function allowFullAdmins({ user: { role } }) {
  return role === "root";
}

const UserRouter = express.Router();

UserRouter.get(
  "/",
  authMiddleware,
  userMiddleware,
  filterMiddleware(allowAdmins),
  UserController.getUsers,
);

UserRouter.get(
  "/:idUser",
  authMiddleware,
  userMiddleware,
  filterMiddleware(allowUsers),
  UserController.getSingleUser,
  notFound,
);

UserRouter.post(
  "/",
  authMiddleware,
  userMiddleware,
  filterMiddleware(allowFullAdmins),
  UserController.createUser,
);

UserRouter.put(
  "/:idUser",
  authMiddleware,
  userMiddleware,
  filterMiddleware(allowFullAdmins),
  UserController.updateUser,
  notFound,
);

UserRouter.delete(
  "/:idUser",
  authMiddleware,
  userMiddleware,
  filterMiddleware(allowFullAdmins),
  UserController.deleteSingleUser,
  notFound,
);

UserRouter.delete(
  "/",
  authMiddleware,
  userMiddleware,
  filterMiddleware(allowFullAdmins),
  UserController.deleteUsers,
);

UserRouter.get(
  "/:idUser/addresses",
  authMiddleware,
  userMiddleware,
  filterMiddleware(allowUsers),
  UserController.getAddresses,
);

UserRouter.get(
  "/:idUser/addresses/:idAddress",
  authMiddleware,
  userMiddleware,
  filterMiddleware(allowUsers),
  UserController.getSingleAddress,
);

UserRouter.post(
  "/:idUser/addresses/",
  authMiddleware,
  userMiddleware,
  filterMiddleware(allowUsers),
  UserController.addAddress,
);

UserRouter.put(
  "/:idUser/addresses/:idAddress",
  authMiddleware,
  userMiddleware,
  filterMiddleware(allowUsers),
  UserController.updateAddress,
);

UserRouter.delete(
  "/:idUser/addresses/:idAddress",
  authMiddleware,
  userMiddleware,
  filterMiddleware(allowUsers),
  UserController.deleteSingleAddress,
);

UserRouter.delete(
  "/:id/addresses/",
  authMiddleware,
  userMiddleware,
  filterMiddleware(allowUsers),
  UserController.deleteAddresses,
);

UserRouter.use("/:id/addresses", notFound);
UserRouter.use("/", notFound);

module.exports = UserRouter;
