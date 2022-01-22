const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const log = require("./logger");

function MongoMemoryServerInstance() {
  const options = {
    autoIndex: true,
  };

  let instance = null;

  async function start() {
    instance = await MongoMemoryServer.create();
  }

  async function stop() {
    await instance.stop();
  }

  async function disconnect() {
    await mongoose.disconnect();
  }

  async function connect() {
    try {
      await mongoose.connect(instance.getUri(), options);

      mongoose.connection.on("error", (error) => log.error(error.message));
    } catch (error) {
      log.error(error.message);
    }
  }

  return {
    start,
    stop,
    connect,
    disconnect,
  };
}

module.exports = MongoMemoryServerInstance();
