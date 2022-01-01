const config = require("./config");
const app = require("./server");
const log = require("./log");
const db = require("./db");

db.connect()
  .then(() => {
    app.listen(4000, () => {
      log.info(`Server listening on localhost:${config.app.port}`);
    });
  })
  .catch((error) => {
    log.warn(`Database connection failed: ${error.message}`);
  });
