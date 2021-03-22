require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const Stock = require("./models/stock");

// Database connection
const dbUrl = process.env.DB_URL || "mongodb://localhost/stocks";
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "db connection error"));
db.once("open", () => {
  console.log(`${dbUrl} connected`);
});

const top20 = [
  "AAPL",
  "MSFT",
  "AMZN",
  "GOOG",
  "GOOGL",
  "FB",
  "TSLA",
  "TSM",
  "BABA",
  "BRK.A",
  "BRK.B",
  "V",
  "JPM",
  "JNJ",
  "MA",
  "WMT",
  "DIS",
  "UNH",
  "NVDA",
  "BAC",
];

const seedStocks = async () => {
  await Stock.deleteMany({});

  // Create mongo entry for each stock
  for (let symbol of top20) {
    const result = await axios
      .get(
        `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${process.env.API_KEY}`
      )
      .then((response) => {
        console.log("response", response);
        return response.data;
      })
      .catch((err) => {
        console.log(err);
      });

    const stock = new Stock({
      symbol: result.symbol,
      companyName: result.companyName,
      prices: [result.latestPrice],
    });
    await stock.save();
  }
};

seedStocks().then(() => {
  mongoose.connection.close();
});
