const express = require("express");
const router = express.Router();
const index = require("../controllers/index")
const User = require("../models/user")
const bcrypt = require("bcrypt")
const catchAsync = require("../utils/catchAsync")
const {validateRegister} = require("../middleware")

router.get("/", index.home)

// Register new user
router.post("/register", validateRegister, catchAsync(async (req, res, next) => {
  const {username, password, confirmPassword} = req.body;
  console.log(username, password, confirmPassword)

  // Hash password and store user in database
  const hashedPassword = await bcrypt.hash(password, 12);
  console.log(hashedPassword)
  const user = new User({
    username,
    password: hashedPassword,
  })
  try {
    await user.save();

  } catch(err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({message: "Username already exists"})
    }
  }
    // // Login user
    // req.login(user, (err) => {
    //   if (err) return next(err);
    // });

  res.status(200).json("user registered");
}))

router.post("/login", (req, res) => {
  res.json("login")
})

router.get("/profile", (req, res) => {
  res.json("profile")
})

router.get("/stocks/:symbol", index.getStock)

module.exports = router;