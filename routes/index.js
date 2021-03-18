const express = require("express");
const router = express.Router();
const index = require("../controllers/index");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");
const { validateRegister, validateLogin } = require("../middleware");
const passport = require("passport");
const issueJWT = require("../utils/issueJWT");

router.get("/", index.home);

// router.get("/list", index.list);

// Register new user
router.post(
  "/register",
  validateRegister,
  catchAsync(async (req, res, next) => {
    const { username, password, confirmPassword } = req.body;
    console.log(username, password, confirmPassword);

    // Hash password and store user in database
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log(hashedPassword);
    const user = new User({
      username,
      password: hashedPassword,
    });

    // Handle username already exists error
    try {
      await user.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: "Username already exists" });
      } else {
        return;
      }
    }

    // Send jwt token to user to authenticate their requests
    const jwt = issueJWT(user);
    console.log(jwt);

    res.status(200).json({
      message: "user registered",
      token: jwt.token,
      expiresIn: jwt.expiresIn,
    });
  })
);

router.post(
  "/login",
  validateLogin,
  catchAsync(async (req, res, next) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });

    if (!user) {
      res.status(400).json({ message: "Incorrect username or password" });
    }
    const isValid = bcrypt.compare(password, user.password);

    // If username and password correct issue JWT token
    if (isValid) {
      const jwt = issueJWT(user);
      res.status(200).json({
        message: "Logged In",
        token: jwt.token,
        expiresIn: jwt.expiresIn,
      });
    } else {
      res.status(401).json({ message: "Incorrect username or password" });
    }
  })
);

router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ message: "You are authorized" });
  }
);

router.get("/stocks/:symbol", index.getStock);

module.exports = router;
