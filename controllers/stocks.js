const catchAsync = require("../utils/catchAsync");
const Stock = require("../models/stock");
const Transaction = require("../models/transaction");
const User = require("../models/user");

// Get all stocks stored in database
module.exports.allStocks = catchAsync(async (req, res, next) => {
  const stocks = await Stock.find({});
  res.json({ stocks });
});

// Buy a stock
module.exports.buyStock = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const { symbol, quantity } = req.body;
  const { cash, _id } = req.user;
  const stock = await Stock.findOne({ symbol });

  // Check if user can afford the purchase
  const totalPrice = quantity * stock.prices[stock.prices.length - 1];
  if (totalPrice > cash) {
    res.status(400).json({ message: "Cannot afford" });
  }

  // Save transaction
  const transaction = new Transaction({
    user: _id,
    stock: stock._id,
    price: stock.prices[stock.prices.length - 1],
    date: new Date(Date.now()),
  });
  await transaction.save();

  // Reduce cash of user
  const remainingCash = (cash - totalPrice).toFixed(2);
  console.log(remainingCash)
  const user = await User.findByIdAndUpdate(_id, { cash: remainingCash });
  console.log(user);
  res.json({ message: "Bought", cash: remainingCash });
});
