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
  const quantity = req.body.quantity;
  const symbol = req.body.stock.symbol;
  const { cash, _id } = req.user;
  let stock = await Stock.findOne({ symbol });

  // If stock not in database add new entry
  if (!stock) {
    const newStock = new Stock({
      symbol,
      companyName: req.body.stock.companyName,
      prices: req.body.stock.prices,
    });
    stock = await newStock.save();
  }

  const totalPrice = quantity * stock.prices[stock.prices.length - 1];
  if (quantity > 0) {
    // Check if user can afford the purchase
    if (totalPrice > cash) {
      res.status(400).json({ message: "Cannot afford" });
    }
  } else if (quantity === 0) {
    res.status(400).json({ message: "Quantity cannot be 0" });
  } else {
    // If negative check user has the required quantity of stocks to sell
    const transactions = await Transaction.find({
      user: _id,
      stock: stock._id,
    });
    let ownedQuantity = 0;
    for (let transaction of transactions) {
      ownedQuantity += transaction.quantity;
    }
    if (quantity > ownedQuantity) {
      res.status(400).json({ message: "You do not have that many to sell" });
    }
  }

  // Save transaction
  const transaction = new Transaction({
    user: _id,
    stock: stock._id,
    price: stock.prices[stock.prices.length - 1],
    quantity: quantity,
    date: new Date(Date.now()),
  });
  await transaction.save();

  // Reduce cash of user
  const remainingCash = (cash - totalPrice).toFixed(2);
  await User.findByIdAndUpdate(_id, { cash: remainingCash });
  res.json({
    message: "Bought",
    cash: remainingCash,
    transaction: transaction,
    newId: stock._id,
  });
});

// Get list of all transaction for a user
module.exports.getTransactions = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const transactions = await Transaction.find({ user: _id });
  res.json({ transactions });
});
