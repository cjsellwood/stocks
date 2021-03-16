if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const methodOverride = require("method-override");
const cors = require("cors")
const compression = require("compression");
const helmet = require("helmet");

// Routes from routes folder
const indexRouter = require("./routes/index");

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
app.use(cors())

// Minimize size of app
app.use(compression());

// Secure app
app.use(helmet());

// Use defined routes
app.use(indexRouter);

// Error handler
app.use((err, req, res, next) => {
  console.log("ERROR", err.message);
  return res.status(400).json({message: err.message})
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("On port " + port);
});
