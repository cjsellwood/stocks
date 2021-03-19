const catchAsync = require("../utils/catchAsync");
const Stock = require("../models/stock");

// Get all stocks stored in database
module.exports.allStocks = catchAsync(async (req, res, next) => {
  const stocks = await Stock.find({});
  res.json({ stocks });
});
