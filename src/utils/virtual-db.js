const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const log = require("../log");

function VirtualDB() {
  const options = {
    autoIndex: true,
  };

  let instance = null;
  let uri = null;

  async function start() {
    instance = await MongoMemoryServer.create();
    uri = instance.getUri();
  }

  function debug() {
    if (uri) {
      log.debug(`MongoDB connected to ${uri}`);
    } else {
      log.debug(`MongoDB not connected yet`);
    }
  }

  async function stop() {
    await mongoose.disconnect();
    await instance.stop();
  }

  async function connect() {
    if (!uri) return log.warn("URI is required to connect to the MongoDB instance");

    try {
      await mongoose.connect(uri, options);

      mongoose.connection.on("error", (error) => {
        log.warn(error);
      });
    } catch (error) {
      log.error(error);
    }
  }

  async function clearCollection(name) {
    await mongoose.connection.db.collection(name).deleteMany();
  }

  return {
    start,
    stop,
    debug,
    connect,
    clearCollection,
  };
}

module.exports = VirtualDB();
