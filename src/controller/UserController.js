const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const {
  referralCode,
  passwordencrypt,
  generateJwt,
  randomid
} = require("../services/CommonServices");
// const { v4: uuid } = require("uuid");

const User = require("../models/user");


exports.SignUp = async (req, res) => {
  try {
    const UserData = req.body;

    if (!UserData.hasOwnProperty("referrer")) {
      return res.status(400).json({
        status: 400,
        message: "Referrer field is required.",
      });
    }

    let user = await User.findOne({ email: UserData.email });

    if (user) {
      res.status(400).json({
        status: 400,
        message: "Email id alredy exits",
      });
    } else {
      let referrer = await User.findOne({
        referralCode: UserData.referrer,
      });

      if (!referrer) {
        return res.status(400).send({
          error: true,
          message: "Invalid referral code.",
        });
      }
      let referrerId;
      referrerId = referrer._id;
      // const id = uuid();
      const id = randomid(4);

      delete UserData.confirmPassword;
      UserData.password = await passwordencrypt(UserData.password);

      UserData.referralCode = referralCode(8);
      UserData.referrerby = referrerId;
      UserData.userId = id;

      const newUser = new User(UserData);
      await newUser.save().then((data, error) => {
        if (error) {
          return res.status(400).json({
            status: 400,
            message: "Not Register",
          });
        } else {
          return res.status(200).json({
            success: true,
            message: "Registration Success",
            referralCode: UserData.referralCode,
            newUser: newUser,
          });
        }
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      //message: responsemessage.SERVERERROR,
    });
  }
};

exports.SignIn = async (req, res) => {
  try {
    let { email, password, _id } = req.body;

    let userLogin = await User.findOne({
      email,
    });

    if (!userLogin) {
      return res.status(404).json({
        status: 404,
        error: true,
        //message: responsemessage.NOTFOUND,
      });
    } else {
      if (userLogin.isactive) {
        return res.status(401).json({
          status: 401,
          message: ISACTIVE,
        });
      } else {
        const isvalid = await bcrypt.compare(password, userLogin.password);

        if (!isvalid) {
          return res.status(404).json({
            status: 404,
            error: true,
            // message: responsemessage.NOTMATCH,
          });
        } else {
          const { error, token } = await generateJwt(userLogin.userId);
          if (error) {
            return res.status(400).json({
              status: 400,
              error: true,
              // message: responsemessage.TOKEN,
            });
          } else {
            userLogin.accesstoken = token;
            await userLogin.save();
            // console.log(userLogin);
            return res.status(201).json({
              status: 201,
              userLogin: email,
              success: true,
              accesstoken: token,
              //message: responsemessage.SUCCESS,
            });
          }
        }
      }
    }
  } catch (err) {
    // console.error("Login error", err);
    return res.status(500).json({
      status: 500,
      // message: responsemessage.NOTSUCCESS,
    });
  }
};

exports.ReferralAccount = async (req, res) => {
  try {
    let { _id, referralCode } = req.decoded;

    const referralAccount = await User.find(
      { referrer: referralCode },
      { email: 1, referralCode: 1, referrerby: 1, _id: 0 }
    );
    return res.send({
      success: true,
      accounts: referralAccount,
      total: referralAccount.length,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

exports.ReferralAccountAll = async (req, res) => {
  try {
    let { _id, referralCode } = req.decoded;

    const referralAccount = await User.find(
      { referrer: referralCode },
      { email: 1, referralCode: 1, referrerby: 1, _id: 0 }
    );
    return res.send({
      success: true,
      accounts: referralAccount,
      total: referralAccount.length,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};


// exports.ReferralAccountById = async (req, res) => {
//   try {
//     let { _id } = req.body;

//     const referralAccount = await User.find(
//       { referrerby: _id },
//       { email: 1, referrerby: 1, _id: 0 }
//     );
//     return res.send({
//       success: true,
//       accounts: referralAccount,
//       total: referralAccount.length,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       error: true,
//       message: error.message,
//     });
//   }
// };

exports.Logout = async (req, res) => {
  try {
    const { id } = req.decoded;

    let user = await User.findOne({ userId: id });

    user.accesstoken = "";

    await user.save();
    console.log(user);
    return res.send({ success: true, message: "User Logged out" });
  } catch (error) {
    console.error("user-logout-error", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
