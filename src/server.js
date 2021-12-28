const config = require("./config/config");

const express = require("express");
const helmet = require("helmet");
const parser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

const { UserRouter, ProductRouter } = require("./routes");
const { error } = require("./middlewares");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    origin: config.client.url,
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(parser.json());

app.use("/products", ProductRouter);
app.use("/users", UserRouter);

app.use(error);

module.exports = app;
