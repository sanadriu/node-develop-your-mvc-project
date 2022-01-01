const log = require("loglevel");

log.enableAll();

module.exports = {
  trace: log.trace,
  debug: log.debug,
  info: log.info,
  warn: log.warn,
  error: log.error,
};
