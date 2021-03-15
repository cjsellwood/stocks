const express = require("express");
const router = express.Router();
const index = require("../controllers/index")

router.get("/", index.home)

router.get("/stocks/:symbol", index.getStock)

module.exports = router;