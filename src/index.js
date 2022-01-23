const config = require("./config");
const app = require("./server");
const log = require("./services/logger");
const db = require("./db");

(async () => {
  try {
    await db.connect();
    await db.seed();

    app.listen(4000, () => {
      log.info(`Server listening on localhost:${config.app.port}`);
    });
  } catch (error) {
    log.warn(`Database connection failed: ${error.message}`);
  }
})();
