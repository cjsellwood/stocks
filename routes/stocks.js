const express = require("express");
const router = express.Router();
const passport = require("passport");
const stocks = require("../controllers/stocks");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  stocks.allStocks
);

router.post(
  "/buy",
  passport.authenticate("jwt", { session: false }),
  stocks.buyStock
);

router.get(
  "/transactions",
  passport.authenticate("jwt", { session: false }),
  stocks.getTransactions
);

module.exports = router;
