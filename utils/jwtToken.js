const jwt = require("jsonwebtoken");

const verifyJWT = async (token) => {
  const user = await jwt.verify(token, process.env.JWT_SECRET);
  return user;
};

module.exports = verifyJWT;
