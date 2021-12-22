const mongoose = require("mongoose");
const config = require("../config/config");

function connection() {
  return mongoose.connect(config.db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },console.log("DB conected"));
}

module.exports = connection;
