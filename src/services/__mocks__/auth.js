const { generateRandomSequence } = require("../../utils");

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

module.exports = {
  createUser: () => Promise.resolve({ uid: generateRandomSequence(28, chars) }),
  updateUser: () => Promise.resolve(),
  deleteUser: () => Promise.resolve(),
  verifyIdToken: () => Promise.resolve({ uid: generateRandomSequence(28, chars) }),
  getUserByEmail: () => Promise.resolve({ uid: generateRandomSequence(28, chars) }),
};
