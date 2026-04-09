const jwt = require("jsonwebtoken");

const generateToken = (payload, expires = "24h") => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expires,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };