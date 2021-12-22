const mongoose = require("mongoose");
const config = require("../config/config");

function connection() {
  return mongoose.connect(config.db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

module.exports = connection;
