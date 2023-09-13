const express = require("express");
const router = express.Router();

const userdata = require("../controller/UserController")
const validataToken = require("../middleware/auth")

router.post("/signup",  userdata.SignUp);
router.post("/signin",  userdata.SignIn);
router.get("/referral",  validataToken,userdata.ReferralAccount);
// router.get("/referralbyid", userdata.ReferralAccountById);
router.get("/logout", validataToken, userdata.Logout);



module.exports = router