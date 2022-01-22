const config = require("./config");
const app = require("./server");
const log = require("./services/logger");
const db = require("./db");

try {
  await db.connect();
  await db.seed();

  mongoose.connection.on("error", (error) => log.warn(error));

  app.listen(4000, () => {
    log.info(`Server listening on localhost:${config.app.port}`);
  });
} catch (error) {
  log.warn(`Database connection failed: ${error.message}`);
}
