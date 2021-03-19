const express = require("express");
const router = express.Router();
const passport = require("passport")
const stocks = require("../controllers/stocks");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  stocks.allStocks
);

module.exports = router;
