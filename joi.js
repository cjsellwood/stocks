const Joi = require("joi");

module.exports.registerSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(8),
  confirmPassword: Joi.ref("password")
}).required();

module.exports.loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(8),
}).required();