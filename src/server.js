const config = require("./config");

const express = require("express");
const helmet = require("helmet");
const parser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

const { UserRouter, ProductRouter, OrderRouter } = require("./routes");
const { errorHandler } = require("./middlewares");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(parser.json());

app.use("/products", ProductRouter);
app.use("/users", UserRouter);
app.use("/orders", OrderRouter);

app.use(errorHandler);

module.exports = app;
