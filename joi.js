const Joi = require("joi");

module.exports.registerSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(8),
  confirmPassword: Joi.ref("password"),
}).required();

module.exports.loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(8),
}).required();

module.exports.buyStockSchema = Joi.object({
  stock: Joi.object({
    symbol: Joi.string().required(),
    buyQuantity: Joi.number(),
    sellQuantity: Joi.number(),
    companyName: Joi.string(),
    prices: Joi.array().items(Joi.number()).required(),
    lastUpdated: Joi.string(),
    _id: Joi.string(),
    __v: Joi.number(),
  }).required(),
  quantity: Joi.number().required(),
}).required();


module.exports.searchSchema = Joi.object({
  symbol: Joi.string().required(),
}).required();