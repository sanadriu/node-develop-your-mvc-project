const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 10,
        max: 200
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        max: 50
    },
    description: {
        type: String,
        trim: true,
    },
    
});
const productsModel = new mongoose.model("products", productSchema);

module.exports = productsModel;

