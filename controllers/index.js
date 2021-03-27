const axios = require("axios");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");
const issueJWT = require("../utils/issueJWT");
const Stock = require("../models/stock");
const ExpressError = require("../utils/ExpressError")
const updatePrices = require("../")

module.exports.home = (req, res) => {
  res.json({ page: "Home" });
};

// Register new user
module.exports.registerUser = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  // Hash password and store user in database
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({
    username,
    password: hashedPassword,
  });

  // Handle username already exists error
  try {
    await user.save();
  } catch (err) {
    if (err.code === 11000) {
      return next(new ExpressError(400, "Username already exists"))
    } else {
      return;
    }
  }

  // Send jwt token to user to authenticate their requests
  const jwt = issueJWT(user);

  res.status(200).json({
    message: "user registered",
    token: jwt.token,
    expiresIn: jwt.expiresIn,
    cash: user.cash
  });
});

// Login a user
module.exports.loginUser = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });

  if (!user) {
    return next(new ExpressError(404, "Incorrect username or password"))
  }
  const isValid = await bcrypt.compare(password, user.password);

  // If username and password correct, issue JWT token
  if (isValid) {
    const jwt = issueJWT(user);
    res.status(200).json({
      message: "Logged In",
      token: jwt.token,
      expiresIn: jwt.expiresIn,
      cash: user.cash
    });
  } else {
    // res.status(404).json({ message: "Incorrect username or password" });
    return next(new ExpressError(404, "Incorrect username or password"))
  }
});

// Get search results
module.exports.search = catchAsync(async (req, res, next) => {
  const { symbol } = req.body;

  // Lookup stock in database first
  const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });

  // If not in database look with api
  if (!stock) {
    await axios
      .get(
        `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${process.env.API_KEY}`
      )
      .then((response) => {
        // If no company name in response, throw error
        if (response.data.volume === 0) {
          return next(new ExpressError(404, `${symbol} is no longer traded`))
        }
        const fetchedStock = {
          symbol: response.data.symbol,
          companyName: response.data.companyName,
          prices: [response.data.latestPrice],
        };
        res.json(fetchedStock)
      })
      .catch((err) => {
        if (err.response.status === 404) {
          return next(new ExpressError(404, `${symbol} is not a stock symbol`));
        } else {
          return next(new ExpressError(400, "Something went wrong"))
        }
      });
  } else {
    res.json(stock);
  }
});

// Run update prices function when requested by app engine cron
module.exports.updatePrices = catchAsync( async (req, res, next) => {
  // Only run if from app engine cron
  if (req.header("X-Appengine-Cron")) {
    console.log(req.headers)
    await updatePrices();
    res.status(200).json({"message": "Updated"})
  } else {
    return next(new ExpressError(400, "Can not access"))
  }
})