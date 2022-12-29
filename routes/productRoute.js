const express = require("express");
const productRoute = express.Router();
const mongoose = require('mongoose');
const productSchema = require('../schema/productSchema');


mongoose.connect("mongodb+srv://mobashir:mobashir123@cluster0.sv5dvda.mongodb.net/Grocery?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("connected with mongodb");
    })
    .catch((err) => {
        console.log(err);
    });
const productModel = new mongoose.model("productData", productSchema);


productRoute.post("/createproduct", async (req, res) => {
    const bodyData = req.body;
    const title = bodyData.title;
    const price = bodyData.price;
    const discount = bodyData.discount;
    const detail = bodyData.detail;
    const imgurl = bodyData.imgurl;
    const catogery=bodyData.catogery;
    // console.log(title,price,discount,detail,imgurl)

    const output = await productModel.create({
        title,price,discount,detail,imgurl,catogery
    });
    res.status(200).json({
        success: true,
        output
    })
})

// get all product 
productRoute.get("/getallproduct", async (req, res) => {

    const output = await productModel.find();
    res.status(200).json({
        success: true,
        output
    })
})


// get fruit products 
productRoute.get("/fruit", async (req, res) => {
    const output = await productModel.find({
        "catogery":"fruit"
    });
    res.status(200).json({
        success: true,
        output
    })
})

// get vegetable products 
productRoute.get("/vegetable", async (req, res) => {
    const output = await productModel.find({
        "catogery":"vegetable"
    });
    res.status(200).json({
        success: true,
        output
    })
})


// get sweet products 
productRoute.get("/sweet", async (req, res) => {
    const output = await productModel.find({
        "catogery":"sweet"
    });
    res.status(200).json({
        success: true,
        output
    })
})

// get dry fruit products 
productRoute.get("/dryfruit", async (req, res) => {
    const output = await productModel.find({
        "catogery":"dryfruit"
    });
    res.status(200).json({
        success: true,
        output
    })
})


// get dairy products 
productRoute.get("/dairy", async (req, res) => {
    const output = await productModel.find({
        "catogery":"dairy"
    });
    res.status(200).json({
        success: true,
        output
    })
})

// search product 
productRoute.post("/search", async (req, res) => {
    const bodyData = req.body;
    const search = bodyData.searchData;

    let regex = {
        title:new RegExp(search,"i"),
        detail:new RegExp(search,"i")
    }
    console.log(regex);
    const productData = await productModel.find({$or:[{title:{$regex:new RegExp(search,"i")}},{detail:{$regex:new RegExp(search,"i")}}]})
    console.log(productData);
    res.status(200).json({
        success: true,
        productData
    })
})

// filters
// sort data 
productRoute.post('/sort', async (req,res)=>{
    const sortData=req.body.sortvalue;
    const page = req.body.page;
    if(page == "All"){
        if(sortData == "default"){
            const output = await productModel.find();
            console.log(output);
            res.status(200).json({
                success: true,
                message: "Card Created Successfully",
                output
            })
        }else if(sortData=="min"){
            const output = await productModel.find().sort({price:'asc'});
            console.log(output);
            res.status(200).json({
                success: true,
                message: "Card Created Successfully",
                output
            })
        }else{
            const output = await productModel.find().sort({price:'desc'});
            console.log(output);
            res.status(200).json({
                success: true,
                message: "Card Created Successfully",
                output
            })
        }
    }else{
        if(sortData == "default"){
            const output = await productModel.find({catogery:page});
            console.log(output);
            res.status(200).json({
                success: true,
                message: "Card Created Successfully",
                output
            })
        }else if(sortData=="min"){
            const output = await productModel.find({catogery:page}).sort({price:'asc'});
            console.log(output);
            res.status(200).json({
                success: true,
                message: "Card Created Successfully",
                output
            })
        }else{
            const output = await productModel.find({catogery:page}).sort({price:'desc'});
            console.log(output);
            res.status(200).json({
                success: true,
                message: "Card Created Successfully",
                output
            })
        }
    }
    

})

// price range
productRoute.post('/priceRange', async (req,res) => {
    const body = req.body;
    const min = body.min;
    const max = body.max;
    console.log();
    const output = await productModel.find({price: {$gte:min, $lte:max}});
    console.log(output);

})
module.exports = productRoute;