const loglevel = require("loglevel");

loglevel.enableAll();

const { trace, debug, info, warn, error } = loglevel;

module.exports = {
  trace,
  debug,
  info,
  warn,
  error,
};
