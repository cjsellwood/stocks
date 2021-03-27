const express = require("express");
const router = express.Router();
const passport = require("passport");
const index = require("../controllers/index");
const { validateRegister, validateLogin, validateSearch } = require("../middleware");

router.get("/", index.home);

// Register new user
router.post("/register", validateRegister, index.registerUser);

// Login a user
router.post("/login", validateLogin, index.loginUser);

// Return search results
router.post(
  "/search",
  validateSearch,
  passport.authenticate("jwt", { session: false }),
  index.search
);

router.get("/updateprices", index.updatePrices)

module.exports = router;
