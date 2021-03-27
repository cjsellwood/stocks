require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const Stock = require("./models/stock");
const fs = require("fs");

// Database connection
// const dbUrl = process.env.DB_URL || "mongodb://localhost/stocks";
// mongoose.connect(dbUrl, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
// });
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "db connection error"));
// db.once("open", () => {
//   console.log(`${dbUrl} connected`);
// });

const updatePrices = async () => {
  // Find all stocks in database
  const stocks = await Stock.find();
  for (let stock of stocks) {
    // Get new quote
    const result = await axios
      .get(
        `https://cloud.iexapis.com/stable/stock/${stock.symbol}/quote?token=${process.env.API_KEY}`
      )
      .then((response) => {
        console.log("response", response);
        return response.data;
      })
      .catch((err) => {
        console.log(err);
      });

    // Add new price to database entry and limit to 7 prices
    await Stock.findByIdAndUpdate(stock._id, {
      $push: { prices: { $each: [result.latestPrice], $slice: -7 } },
    });
  }
};

module.exports = updatePrices;

// updatePrices().then(() => {
//   console.log("DONE", Date.now());
// })

// module.exports = () => {
//   fs.readFile("./updated.json", async (err, file) => {
//     const json = JSON.parse(file);
//     const lastUpdated = json.updated;
//     const now = Date.now();

//     // Run if at least 23.5 hours since last update
//     if (now > lastUpdated + 1000 * 60 * 60 * 23.5) {
//       // Update prices in database
//       updatePrices().then(() => {
//         fs.writeFile(
//           "./updated.json",
//           JSON.stringify({ updated: now }),
//           "utf8",
//           (err) => {
//             console.log("UPDATED DB PRICES");
//           }
//         );
//       });
//     }
//   });
// };
