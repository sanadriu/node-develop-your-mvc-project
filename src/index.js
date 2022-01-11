const config = require("./config");
const app = require("./server");
const log = require("./log");
const db = require("./db");
const seedData = require("./utils/seed-data");

db.connect()
  .then(async () => {
    //await seedData();

    app.listen(4000, () => {
      log.info(`Server listening on localhost:${config.app.port}`);
    });
  })
  .catch((error) => {
    log.warn(`Database connection failed: ${error.message}`);
  });
