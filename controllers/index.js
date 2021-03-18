const axios = require("axios");
const catchAsync = require("../utils/catchAsync")

module.exports.home = (req, res) => {
  res.json({ page: "Home" });
};

module.exports.getStock = catchAsync(async (req, res, next) => {
  const symbol = req.params.symbol;
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
  console.log("result", result);
  res.json({
    symbol: result.symbol,
    companyName: result.companyName,
    price: result.latestPrice,
    closeTime: result.closeTime,
    closeDate: new Date(result.closeTime),
    nowDate: new Date(Date.now()),
  });
});

// Get list of all stocks
// module.exports.list = catchAsync(async (req, res, next) => {
//   const result = await axios
//     .get(
//       `https://cloud.iexapis.com/stable/ref-data/symbols?token=${process.env.API_KEY}`
//     )
//     .then((response) => {
//       console.log("response", response);
//       return response.data;
//     })
//     .catch((err) => {
//       console.log(err);
//     });
//   console.log("result", result);
//   console.dir(result);
//   console.log("length", result.length)
//   res.json(result)
// })