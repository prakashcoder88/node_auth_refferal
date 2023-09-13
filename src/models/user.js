// const { access } = require("fs")
const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({

    userId:{
        type:String,
        require:false
    },
    username :{
        type:String,
        require:false
    },
    email:{
        type: String,
        require:false
    },
    password:{
        type:String,
        require:false
    },
    referralCode:{
        type:String,
        require:false
    },
    referrer: { 
        type: String, 
        default: null 
    },
    referrerby:{
        type:String,
        require:false
    },
    isactive:{
        type:Boolean,
        default:false
    },
    accesstoken:{
        type:String,
        require:false
    }
})

 const User = mongoose.model("User", UserSchema)
 module.exports = User