const admin = require("firebase-admin");
const serviceAccount = require("../../firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const { createUser, getUserByEmail, updateUser, deleteUser, verifyIdToken } = admin.auth();

module.exports = {
  createUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  verifyIdToken,
};
