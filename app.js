if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const methodOverride = require("method-override");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

// Routes from routes folder
const indexRouter = require("./routes/index");
const stocksRouter = require("./routes/stocks");

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

// Parse requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Allows methods other than GET or POST
app.use(methodOverride("_method"));

// Sanitize mongo queries
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

// Allow requests from frontend
app.use(cors());

// Minimize size of app
app.use(compression());

// Secure app
app.use(helmet());

// Passport with jwt configuration
const passport = require("passport");
const User = require("./models/user");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const ExpressError = require("./utils/ExpressError");
const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_PRIVATE;

passport.use(
  new JwtStrategy(opts, async (payload, done) => {
    const user = await User.findOne({ _id: payload.sub });
    console.log(payload);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  })
);

app.use(passport.initialize());

// Use defined routes
app.use("/", indexRouter);
app.use("/stocks", stocksRouter);

// Handle undefined route error
app.use("*", (req, res, next) => {
  return next(new ExpressError(404, "Route does not exist"))
})

// Error handler
app.use((err, req, res, next) => {
  console.log("ERROR", err.message);
  return res.status(err.statusCode).json({ message: err.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("On port " + port);
});
