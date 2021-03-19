const express = require("express");
const router = express.Router();
const index = require("../controllers/index");

const { validateRegister, validateLogin } = require("../middleware");
const passport = require("passport");


router.get("/", index.home);

// Register new user
router.post("/register", validateRegister, index.registerUser);

// Login a user
router.post("/login", validateLogin, index.loginUser);

// Test route thats only for authenticated users
router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ message: "You are authorized" });
  }
);

// Return search results
router.get(
  "/search",
  passport.authenticate("jwt", { session: false }),
  index.search
);

router.get("/stocks/:symbol", index.getStock);

module.exports = router;
