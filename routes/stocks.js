const express = require("express");
const router = express.Router();
const passport = require("passport");
const stocks = require("../controllers/stocks");
const {validateBuyStock} = require("../middleware")

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  stocks.allStocks
);

router.post(
  "/buy",
  validateBuyStock,
  passport.authenticate("jwt", { session: false }),
  stocks.buyStock
);

router.get(
  "/transactions",
  passport.authenticate("jwt", { session: false }),
  stocks.getTransactions
);

module.exports = router;
