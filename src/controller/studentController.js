const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();
const Student = require("../models/student")
const {
    randomid
  } = require("../services/CommonServices");

exports.register = async (req, res) => {
    try {
      const StudentData = req.body;
      let Student = await Student.findOne({ email: StudentData.email });
  
      if (Student) {
        res.status(400).json({
          status: 400,
          message: "Email id alredy exits",
        });
      } else {
        let referrer = await Student.findOne({
          referralCode: StudentData.referrer,
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
  
        delete StudentData.confirmPassword;
        StudentData.password = await passwordencrypt(StudentData.password);
  
 
        StudentData.StudentId = id;
  
        const newStudent = new Student(StudentData);
        await newStudent.save().then((data, error) => {
          if (error) {
            return res.status(400).json({
              status: 400,
              message: "Not Register",
            });
          } else {
            return res.status(200).json({
              success: true,
              message: "Registration Success",
              referralCode: StudentData.referralCode,
              newStudent: newStudent,
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