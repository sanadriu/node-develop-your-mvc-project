const express = require("express");
const { error } = require("./middlewares");
const { json } = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");



const app = express();

app.use(json());
app.use(morgan("dev"));
app.use(helmet());

app.get("/", (req, res) => {
  res.status(200).send({
    data: "hello-mundo",
  });
});


//--------------------------- products CRUD--------------------------------------------------
const productsRouter = require("./routes/products-routes");
app.use("/products",productsRouter);
app.use(error);


module.exports = app;
