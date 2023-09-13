const express = require("express")
const bodyParser = require("body-parser")
require("dotenv").config();

port = 4000


const nodeauth = require("./src/config/dbconfig")
const userRoute = require("./src/routes/UserRoute")

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/user", userRoute)

app.listen(port, ()=>{
    console.log(`Server connected ${port}`);
})