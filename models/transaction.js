const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  stock: {
    type: Schema.Types.ObjectId,
    ref: "Stock",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
