const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config();


function referralCode(length){
    let code = "";
    const CHARACTER_SET =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  
    const CHARACTER_SETLENGTH = CHARACTER_SET.length
    let CHARACTER = 0
    while(CHARACTER < length){
        code += CHARACTER_SET.charAt(Math.floor(Math.random() * CHARACTER_SETLENGTH));
        CHARACTER += 1;
    } 
    return code;
}


async function passwordencrypt (password){
    let salt = await bcrypt.genSalt(10);
    let passwordHash = bcrypt.hash(password,salt)
    return passwordHash
}

function randomid(length){
    let result = "";
    let CHARACTER = '0123456789';
    let CHARACTER_SETLENGTH = CHARACTER.length;
    let counter = 0;
    while(counter < length){
        result+=CHARACTER.charAt(Math.floor(Math.random()*CHARACTER_SETLENGTH));
        counter+= 1;
    }
    return result;
}

const options = {
    expiresIn: "1h",
  };
async function generateJwt(userId){
    try {
        let payload = {id:userId}
        const token = await jwt.sign(payload, process.env.JWT_SECRET, options)
        return{error:false, token}
        
    } catch (error) {
        return {error:true}
    }
   
}

module.exports ={
    referralCode,
    passwordencrypt,
    generateJwt,
    randomid
}