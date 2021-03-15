const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stockSchema = Schema({
  symbol: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: Date,
    required: true,
  },
  prices: [Number],
});

module.exports = mongoose.model("Stock", stockSchema);
