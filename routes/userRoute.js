const express = require("express");
const userRoute = express.Router();
const mongoose = require('mongoose');
const userSchema = require('../schema/userSchema')
const bcrypt = require("bcryptjs");
const productSchema = require('../schema/productSchema');
mongoose.connect("mongodb+srv://mobashir:mobashir123@cluster0.sv5dvda.mongodb.net/Grocery?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("connected with mongodb");
    })
    .catch((err) => {
        console.log(err);
    });


// signup
const userModel = new mongoose.model("userData", userSchema)
userRoute.post("/signup", async (req, res) => {

    const bodyData = req.body;
    const name = bodyData.name;
    const number = bodyData.number;
    const email = bodyData.email;
    const password = bodyData.password;
    console.log(name, number, email, password);

    const output = await userModel.create({
        name, number, email, password
    });
    const token = output.getJwtToken();
    // console.log(token);
    // output.token = token;
    // await output.updateOne({_id:output._id},{token:token});
    output.token = token;
    await output.save();

    res.status(200).json({
        success: true,
        message: "User Register Successfully",
        "token": token
    })
})

//login routes
userRoute.post('/login', async (req, res) => {
    const bodyData = req.body;
    const email = bodyData.email;
    const password = bodyData.password;
    const userData = await userModel.findOne({ email: email });
    console.log(userData);
    let token = userData.getJwtToken();
    if (!userData) {
        return res.json({ status: 200, message: "User Not Exist Please Register First", "key": 0, "token": null })
    } else {
        const result2 = await bcrypt.compare(password, userData.password);
        if (result2) {
            console.log("match");
            userData.token = token;
            await userData.save();
            return res.json({ status: 200, message: "User Successfully Login", "key": 1, "token": token })
        } else {
            return res.json({ status: 200, message: "Email Id Or Password Did Not Match", "key": 0, "token": null })
        }

    }
})

// add to cart 
userRoute.post('/addtocart', async (req, res) => {
    const bodyData = req.body;
    const prod_ID= bodyData.prod_id;
    console.log(bodyData);
    const quantity=bodyData.quantity;
    let cookie = bodyData.token;

    // cookie = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzYWJkY2FjNjQ2N2Q3MGU1NTE2MGIyNCIsImlhdCI6MTY3MjIwNzUzMiwiZXhwIjoxNjcyNjM5NTMyfQ.DQ9BAFqh1lscv8_UVIQRFPGS7YwA4iWUrHuJ_302hgw";
    const user = await userModel.findOne({token:cookie});
    // user.cart.push({prod_ID:prod_ID,quantity:quantity});
    // let userCart = [];
    if(user.cart.length == 1){
        if(user.cart[0].prod_ID == "" && user.cart[0].quantity == 0){
            user.cart = [];
        }
    }
    let userCart = user.cart;
    
    let checkFlag = 0;
    for(let i=0;i<userCart.length;i++){
        let singleCart = userCart[i];
        if(singleCart.prod_ID === prod_ID){
            checkFlag = 1;
            singleCart.quantity = singleCart.quantity+quantity;
            break;
        }
    }
    if(checkFlag === 0){
        user.cart.push({prod_ID:prod_ID,quantity:quantity});
    }
    await user.save();
    const lengthOfCart = user.cart.length;
    res.status(200).json({
        success: true,
        user,
        lengthOfCart
    })
})

//update quantity
userRoute.post('/updateQuantity', async (req, res) => {
    const body = req.body;
    const finalQuantity = body.finalQuantity;
    const token = body.token;
    const id = body.id;
    const user = await userModel.findOne({token:token});
    // user.cart.push({prod_ID:prod_ID,quantity:quantity});
    let userCart = user.cart;
    let userCartForDelete = [];
    if(finalQuantity == 0){
        for(let i=0;i<userCart.length;i++){
            let singleCart = userCart[i];
            if(singleCart.prod_ID !== id){
                userCartForDelete.push(singleCart);
            }
        }
        if(userCartForDelete.length == 0){
            userCartForDelete.push({prod_ID: "", quantity:0});
        }
        user.cart = userCartForDelete;
    }else{
        for(let i=0;i<userCart.length;i++){
            let singleCart = userCart[i];
            if(singleCart.prod_ID === id){
                singleCart.quantity = finalQuantity;
                break;
            }
        }
    }
    
    await user.save();
    res.status(200).json({
        success: true
    })

})

//fetch cart
const productModel = new mongoose.model("productData", productSchema);
userRoute.post('/fetchCart', async(req, res) => {
    const body = req.body;
    const token = body.token;
    // console.log(token);
    const user = await userModel.findOne({token:token});
    // console.log(user);
    let cartData  = user.cart;
    if(cartData.length == 1){
        if(cartData[0].prod_ID == "" && cartData[0].quantity == 0){
            cartData = [];
        }
    }
    let fullCartDetails = [];
    for(let i=0;i<cartData.length;i++){
        let e = cartData[i];
        let prodid = e.prod_ID;
        let singleProd = await productModel.findOne({_id: prodid});
        // console.log(singleProd);
        console.log(singleProd);
        let singleProd_ = {...singleProd, quantity:e.quantity}
        fullCartDetails.push(singleProd_);

    }
    console.log(fullCartDetails);
    res.status(200).json({
        success: true,
        fullCartDetails
    })
})

// place order
userRoute.post('/placeorder',async(req,res)=>{
    const body=req.body;
    const token=body.token;
    const user = await userModel.findOne({token:token});
    let cartData  = user.cart;
    // if(cartData.length == 1){
    //     if(cartData[0].prod_ID == "" && cartData[0].quantity == 0){
    //         cartData = [];
    //     }
    // }
    let mrp = 0;
    let discount = 0;
    let total = 0;
    for(let i=0;i<cartData.length;i++){
        let e = cartData[i];
        let prodid = e.prod_ID;
        let singleProd = await productModel.findOne({_id: prodid});
        mrp = mrp + (singleProd.price * e.quantity);
        discount = discount + (((singleProd.price * singleProd.discount) / 100) * e.quantity);
    }
    total = mrp - Math.floor(discount) + 40;
    discount = Math.floor(discount);

    let finalCartValue = {
        mrp,
        discount,
        total
    }
    res.status(200).json({
        success: true,
        finalCartValue
    })

})

// order detail 
userRoute.post("/orderdetail", async (req, res) => {

    const bodyData = req.body;
    const name = bodyData.name;
    const number = bodyData.number;
    const pincode = bodyData.pincode;
    const state = bodyData.state;
    const add = bodyData.add;
    console.log(name, number, pincode, state,add );

    const token=bodyData.token;
    const user = await userModel.findOne({token:token});
    let userOrder = user.order;
    let firstFlag = 0;
    if(userOrder.length == 1){
        let oneOrder = userOrder[0];
        let oneAddress = oneOrder.addressDetails;
        if(oneAddress.key == 0){
            firstFlag = 1;
        }
    }
    let finalOrderCart = [];
    let cart_ = user.cart;
    for(let i=0;i<cart_.length;i++){
        let oneCart = cart_[i];
        let prodid = oneCart.prod_ID;
        let singleProd = await productModel.findOne({_id: prodid});
        let finalObject = {
            prod_ID:prodid,
            prod_mrp: singleProd.price,
            prod_discount: singleProd.discount,
            prod_total: (singleProd.price - Math.floor((singleProd.price*singleProd.discount)/100)),
            quantity: oneCart.quantity
        }
        finalOrderCart.push(finalObject);

    }
    if(firstFlag == 1){
        let orderArray = [{
            addressDetails: {
                name:name,
                number:number,
                pincode:pincode,
                state:state,
                add: add
            },
            cart:finalOrderCart
        }];
        user.order = orderArray;
    }else{
        let orderObject = {
            addressDetails: {
                name:name,
                number:number,
                pincode:pincode,
                state:state,
                add: add
            },
            cart:finalOrderCart
        };
        user.order.push(orderObject);
    }

    user.cart = [{prod_ID:"", quantity:0}];
    await user.save();

    res.status(200).json({
        success: true,
        user
    })
})

module.exports = userRoute;