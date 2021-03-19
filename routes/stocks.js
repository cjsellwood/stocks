const express = require("express");
const router = express.Router();
const stocks = require("../controllers/stocks")

router.get("/", stocks.allStocks)

module.exports = router;