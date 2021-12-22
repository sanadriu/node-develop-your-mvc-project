const app = require("./server");
const connection = require("./db/connection");
const {
  logger,
  app: { PORT },
} = require("./config/config");

connection()
  .then(() => {
    app.listen(4000, () => {
      logger.info(`Server listening on localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.warn(`Database connection failed: ${error.message}`);
  });
