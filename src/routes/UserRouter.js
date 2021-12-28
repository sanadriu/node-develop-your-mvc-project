const express = require("express");

const {
  notFound,
  authMiddleware,
  accessMiddleware,
  filterMiddleware,
} = require("../middlewares");
const { UserController } = require("../controllers");

function allowUsers({ user: { role, id }, params: { idUser } }) {
  console.log(role, id, idUser);

  return (
    ["admin", "full-admin"].includes(role) ||
    (role === "customer" && id === idUser)
  );
}

function allowAdmins({ user: { role } }) {
  console.log(role);

  return ["admin", "full-admin"].includes(role);
}

function allowFullAdmins({ user: { role } }) {
  console.log(role);
  return role === "root";
}

const UserRouter = express.Router();

UserRouter.get(
  "/",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowAdmins),
  UserController.getUsers,
);

UserRouter.get(
  "/:idUser",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.getSingleUser,
  notFound,
);

UserRouter.post(
  "/",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowFullAdmins),
  UserController.createUser,
);

// Unrestricted user creation. Be careful.
// UserRouter.post("/", UserController.createUser);

UserRouter.post("/sign-up", UserController.signUp);

UserRouter.put(
  "/:idUser",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowFullAdmins),
  UserController.updateUser,
  notFound,
);

UserRouter.delete(
  "/",
  // authMiddleware,
  // accessMiddleware,
  // filterMiddleware(allowFullAdmins),
  UserController.deleteUsers,
);

UserRouter.delete(
  "/:idUser",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowFullAdmins),
  UserController.deleteSingleUser,
  notFound,
);

UserRouter.get(
  "/:idUser/details",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.getDetails,
  notFound,
);

UserRouter.put(
  "/:idUser/details",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.updateDetails,
  notFound,
);

UserRouter.get(
  "/:idUser/addresses",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.getAddresses,
);

UserRouter.get(
  "/:idUser/addresses/:idAddress",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.getSingleAddress,
);

UserRouter.post(
  "/:idUser/addresses/",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.addAddress,
);

UserRouter.put(
  "/:idUser/addresses/:idAddress",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.updateAddress,
);

UserRouter.delete(
  "/:id/addresses/",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.deleteAddresses,
);

UserRouter.delete(
  "/:idUser/addresses/:idAddress",
  authMiddleware,
  accessMiddleware,
  filterMiddleware(allowUsers),
  UserController.deleteSingleAddress,
);

UserRouter.use("/:id/addresses", notFound);
UserRouter.use("/", notFound);

module.exports = UserRouter;
