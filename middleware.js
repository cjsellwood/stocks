const { registerSchema } = require("./joi")

module.exports.validateRegister = (req, res, next) => {
  const isValid = registerSchema.validate(req.body);
  if (isValid.error) {
    const message = isValid.error.details.map((error) => error.message).join(",");
    return res.status(400).json({message})
  }
  next();
}