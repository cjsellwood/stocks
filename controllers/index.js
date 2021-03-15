const axios = require("axios");

module.exports.home = (req, res) => {
  res.json({ page: "Home" });
};

module.exports.getStock = async (req, res, next) => {
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
    closePrice: result.close,
    closeTime: result.closeTime,
    closeDate: new Date(result.closeTime),
    nowDate: new Date(Date.now()),
  });
};
