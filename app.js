if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");

// Routes from routes folder
const indexRouter = require("./routes/index");

// Database connection
const dbUrl = process.env.DB_URL || "mongodb://localhost/stocks";
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "db connection error"));
db.once("open", () => {
  console.log(`${dbUrl} connected`);
});

// Parse requests
app.use(express.urlencoded({extended:true}))
app.use(express.json())

// Sanitize mongo queries
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

// Use defined routes
app.use(indexRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("On port " + port);
});
