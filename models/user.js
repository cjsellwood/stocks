const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cash: {
    type: Number,
    default: 10000,
  }
})

module.exports = mongoose.model("User", userSchema);
