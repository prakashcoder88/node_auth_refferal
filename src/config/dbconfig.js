const express = require("express")
const mongoose = require("mongoose")
require("dotenv").config()



mongoose
.connect(process.env.MONGO_URI, {
    dbName:"nodeauth"
})
.then(() =>{
   
    console.log("Successfully Connected");
})
.catch((error) =>{
    console.log("Not Connected Successfully",error);
})



