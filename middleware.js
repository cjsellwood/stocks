const { registerSchema, loginSchema, buyStockSchema, searchSchema } = require("./joi");
const ExpressError = require("./utils/ExpressError");

module.exports.validateRegister = (req, res, next) => {
  const isValid = registerSchema.validate(req.body);
  if (isValid.error) {
    let message = isValid.error.details.map((error) => error.message).join(",");
    if (message = '"confirmPassword" must be [ref:password]') {
      message = "Passwords do not match"
    }
    return next(new ExpressError(400, message))
  }
  next();
}

module.exports.validateLogin = (req, res, next) => {
  const isValid = loginSchema.validate(req.body);
  if (isValid.error) {
    const message = isValid.error.details.map((error) => error.message).join(",");
    return next(new ExpressError(400, message))
  }
  next();
}

module.exports.validateBuyStock = (req, res, next) => {
  const isValid = buyStockSchema.validate(req.body);
  if (isValid.error) {
    const message = isValid.error.details.map((error) => error.message).join(",");
    return next(new ExpressError(400, message))
  }
  next();
}

module.exports.validateSearch = (req, res, next) => {
  const isValid = searchSchema.validate(req.body);
  if (isValid.error) {
    const message = isValid.error.details.map((error) => error.message).join(",");
    return next(new ExpressError(400, message))
  }
  next();
}

