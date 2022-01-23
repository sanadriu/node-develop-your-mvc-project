const { generateRandomSequence } = require("../../utils");

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

module.exports = {
  createUser: () => Promise.resolve({ uid: generateRandomSequence(28, chars) }),
  updateUser: () => Promise.resolve(),
  deleteUser: () => Promise.resolve(),
  verifyIdToken: (authToken) => Promise.resolve({ uid: authToken }),
  getUserByEmail: () => Promise.resolve({ uid: generateRandomSequence(28, chars) }),
};
