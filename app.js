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
const user = require("./models/user");

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

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const bcrypt = require("bcrypt");
const catchAsync = require("./utils/catchAsync");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const opts = {};

// Passport authentication
passport.use(
  new LocalStrategy(
    {
      session: false,
    },

    catchAsync(async (username, password, done) => {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      if (!bcrypt.compare(password, user.password)) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      return done(null, user);
    })
  )
);

// In react - Authorization: bearer token
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_PRIVATE;

passport.use(
  new JwtStrategy(
    opts,
    async (payload, done) => {
      console.log(payload)
      const user = await User.findOne({ _id: payload.sub });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    }
  )
);

app.use(passport.initialize());

// Use defined routes
app.use(indexRouter);

// Error handler
app.use((err, req, res, next) => {
  console.log("ERROR", err.message);
  return res.status(400).json({ message: err.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("On port " + port);
});
