const axios = require("axios");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");
const issueJWT = require("../utils/issueJWT");
const Stock = require("../models/stock");
const ExpressError = require("../utils/ExpressError")

module.exports.home = (req, res) => {
  res.json({ page: "Home" });
};

// Register new user
module.exports.registerUser = catchAsync(async (req, res, next) => {
  const { username, password, confirmPassword } = req.body;

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
      return res.status(400).json({ message: "Username already exists" });
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
    res.status(400).json({ message: "Incorrect username or password" });
  }
  const isValid = bcrypt.compare(password, user.password);

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
    res.status(401).json({ message: "Incorrect username or password" });
  }
});

// Get search results
module.exports.search = catchAsync(async (req, res, next) => {
  const { symbol } = req.query;
  console.log(symbol);
  // Lookup stock in database first
  const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });

  // If not in database look with api
  if (!stock) {
    await axios
      .get(
        `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${process.env.API_KEY}`
      )
      .then((response) => {
        console.log("response", response.data);
        // Send error if not found
        // if (!response.data) {
        //   // const err = {message: "Not found"}
        //   // return next(new Error("Not Found!!!"));
        //   // return next(new ExpressError(404, "Not Found"))
        //   console.log("not found error")
        //   return next(err);
        //   // return res.status(404).json({message: "Not found"})
        // }
        const fetchedStock = {
          symbol: response.data.symbol,
          companyName: response.data.companyName,
          prices: [response.data.latestPrice],
        };
        res.json(fetchedStock)
      })
      .catch((err) => {
        return next(new ExpressError(404, "Not found"));
      });
  } else {
    res.json(stock);
  }
});

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
  });
});
