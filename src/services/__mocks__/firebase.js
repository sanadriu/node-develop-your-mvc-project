const generateRandomSequence = require("../../utils/generateRandomSequence");

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

module.exports = {
  auth: {
    createUser: () => ({ uid: generateRandomSequence(28, chars) }),
    getUserByEmail: () => ({ uid: generateRandomSequence(28, chars) }),
    updateUser: () => {},
    deleteUser: () => {},
  },
};
