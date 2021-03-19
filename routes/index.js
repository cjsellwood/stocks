const express = require("express");
const router = express.Router();
const passport = require("passport");
const index = require("../controllers/index");
const { validateRegister, validateLogin } = require("../middleware");

router.get("/", index.home);

// Register new user
router.post("/register", validateRegister, index.registerUser);

// Login a user
router.post("/login", validateLogin, index.loginUser);

// Return search results
router.get(
  "/search",
  passport.authenticate("jwt", { session: false }),
  index.search
);

router.get("/stocks/:symbol", index.getStock);

module.exports = router;
