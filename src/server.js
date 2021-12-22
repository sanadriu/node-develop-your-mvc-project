const express = require("express");
const { json } = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

app.use(json());
app.use(morgan("dev"));
app.use(helmet());


//--------------------------- products CRUD--------------------------------------------------
const productsRouter = require("./routes/products-routes")
app.use(productsRouter)
//------------------------------------------------------------------------------------------





app.get("/", (req, res) => {
  res.status(200).send({
    data: "hello-mundo",
  });
});



module.exports = app;
