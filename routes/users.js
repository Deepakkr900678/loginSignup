const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'deepakkr900678@gmail.com',
      pass: 'Dk@7004036425', 
    },
  });

  const mailOptions = {
    from: 'deepakkr900678@gmail.com', 
    to: email, 
    subject: 'OTP Verification', 
    text: `Your OTP for signup is: ${otp}`, 
  };

  await transporter.sendMail(mailOptions);
};

const signup = async (req, res) => {
  const { name, email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = new User({ name, email, otp, isEamilVerified: false });
    await user.save();

    await sendOtpEmail(email, otp);

    const token = jwt.sign({ userId: user._id }, "webseeder-task", {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Signup Successfully, OTP sent to the email successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email, otp });

    if (user) {
      user.isEamilVerified = true;
      await user.save();

      const token = jwt.sign({ userId: user._id }, "webseeder-task", {
        expiresIn: "1h",
      });
      res.status(200).json({
        message: "Login Successfully",
        token,
      });
    } else {
      res.status(401).json({
        message: "Invalid OTP or user not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

router.post('/signup', signup);
router.post('/login', login);

module.exports = router;
