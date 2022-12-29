const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'please enter product title']
    },
    imgurl:{
      type:String,
      required:[true,"Enter Your Image Url"]  
    },
    price: {
        type: Number,
        required: [true, 'please enter price']
    },
    discount: {
        type: Number,
        required: [true, 'enter your discount']
    },
    detail: {
        type: String,
        required: [true, 'please enter detail'],
    },
    catogery:{
        type:String,
        required:[true, "select product catogery"]
    },
    review: {
        type:Number,
        default:0
    },
});

module.exports = productSchema;