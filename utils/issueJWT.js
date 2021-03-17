const jsonwebtoken = require("jsonwebtoken")

module.exports = (user) => {
  const _id = user._id;
  // Expires in 1 day
  const expiresIn = `${1000 * 60 * 60 * 24}`;
  const payload = {
    sub: _id,
    iat: Date.now(),
  };
  const signedToken = jsonwebtoken.sign(payload, process.env.JWT_PRIVATE, {
    expiresIn,
  });
  return {
    token: signedToken,
    expiresIn,
  };
}