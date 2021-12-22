const db = require("../models");

async function getProducts(req, res, next) {
    try {
        res.status(200).send({
            data: "hello-products",
          });
        // const users = await db.products.find({}).lean().exec();
        // console.log(users)
        // res.status(200).send({
        //     data: users
        // })
    } catch (err) {
        // next(err);
        console.log(err)
    }
}

async function createProducts(req, res, next) {
    try {
        data = req.body
        const dbRes = await db.products.create(data);
        res.status(201).send({
            success: true,
            data: dbRes
        })
    } catch (err) {
        // next(err)
        console.log(err)

    }
}

module.exports = {
    getProducts: getProducts,
    createProducts:createProducts,
}