const config = require("./config/config");

const express = require("express");
const helmet = require("helmet");
const json = require("body-parser").json;
const morgan = require("morgan");
const cors = require("cors");

const { UserRouter, ProductRouter } = require("./routes");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(json());
app.use(
  cors({
    origin: config.client.URL,
  }),
);

app.get("/", (req, res) => {
  res.status(200).send({
    data: "hello-mundo",
  });
});

app.use("/products", ProductRouter);
app.use("/users", UserRouter);

app.use(error);

module.exports = app;
