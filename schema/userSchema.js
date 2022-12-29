const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please enter your name'],
        maxLength: [30, "name can not exceed more than 30 Character"],
        minLength: [3, "name can not be less then 3 Character"]
    },
    number: {
        type: Number,
        required: [true, 'please enter phone number'],
        minLength: [10, 'phone number should be 10 digit']
    },
    email: {
        type: String,
        required: [true, 'please enter Email'],
    },
    password: {
        type: String,
        required: [true, 'please enter your query or message'],
        select: true
    },
    user:{
        type:String,
        required:true,
        default:"user"
    },
    cart:{
        type:[{
            prod_ID:{
                type:String,
                default:""
            },
            quantity:{
                type:Number,
                default:0
            }
        }],
        default:[-1]
    },
    order:{
        type:[{
            cart:{
                type:[{
                    prod_ID:{
                        type:String,
                        default:""
                    },
                    prod_mrp:{
                        type:Number,
                        default:0
                    },
                    prod_discount:{
                        type:Number,
                        default:0
                    },
                    prod_total:{
                        type:Number,
                        default:0
                    },
                    quantity:{
                        type:Number,
                        default:0
                    }
                }]
            },
            addressDetails:{
                type: Object,
                default: {"key":0}
            }

        }],
        default:[-1]
    },
    token:{
        type:String,
        default:""
    }
});

//to hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})

// to get jwt token 
userSchema.methods.getJwtToken=function(){
    return jwt.sign({id:this._id},"ABCD",{
        expiresIn:"5d"
    })
}

module.exports = userSchema;