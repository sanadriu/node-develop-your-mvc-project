const db = require("../models/");

async function getProducts(req, res, next) {
    try {
        const products = await db.products.find({}).lean().exec();

        res.status(200).send({
            data: products
        })
    } catch (err) {
        next(err);
    }
}

async function createProducts(req, res, next) {
    try {
        const product = req.body;
        const result = await db.products.create(product);
        res.status(201).send({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function getSingleProduct(req, res, next) {
    try {
        const productId = req.params['productId']
        const product = await db.products.find({ "_id": productId })
            .exec()
        res.status(200).send({
            data: product
        })
    } catch (err) {
        next(err);
    }
}

async function updateProduct(req, res, next) {
    try {
        const productId = req.params['productId']
        const data = req.body
        const response = await db.products.findByIdAndUpdate(productId, {...data }).lean().exec()
        res.status(202).send({
            data: response
        })
    } catch (err) {
        next(err)
    }
}
// 

async function deleteProduct(req, res, next) {
    try {
        const productId = req.params['productId']
        await db.products.findByIdAndDelete({ "_id": productId }).lean().exec()
    } catch (err) {
        next(err)
    }
}


module.exports = {
    getProducts: getProducts,
    createProducts: createProducts,
    getSingleProduct: getSingleProduct,
    updateProduct: updateProduct,
    deleteProduct:deleteProduct
    
};
