const app = require("./server");
const connection = require("./db/connection");
const {
  logger,
  app: { port },
} = require("./config/config");

connection()
  .then(() => {
    app.listen(4000, () => {
      logger.info(`Server listening on localhost:${port}`);
    });
  })
  .catch((error) => {
    logger.warn(`Database connection failed: ${error.message}`);
  });
