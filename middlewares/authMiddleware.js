const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../custom-error/customError");
const verifyJWT = require("../utils/jwtToken");
const Token = require("../model/token");
const attachcookie = require("../utils/cookie");

const authMiddleware = async (req, res, next) => {
  const { accessToken, refreshTokenJWT } = req.signedCookies;
  if (!accessToken && !refreshTokenJWT) {
    throw new CustomAPIError("Authentication Invalid", StatusCodes.BAD_REQUEST);
  }
  try {
    if (accessToken) {
      const userData = await verifyJWT(accessToken);
      const testUser = userData.userId === "6710f85edca1fb3b95276991";
      req.user = { ...userData, testUser };
      return next();
    }

    const { tokenUser, refreshToken } = await verifyJWT(refreshTokenJWT);
    const tokenCheck = await Token.findOne({ refreshToken });
    if (!tokenCheck || !tokenCheck.isValid)
      throw new CustomAPIError(
        "Authentication Invalid",
        StatusCodes.BAD_REQUEST
      );
    const { userId, name, email, roles, location } = tokenUser;
    req.user = { userId, name, email, roles, location };
    await attachcookie(res, tokenUser, refreshToken);
    next();
  } catch (error) {
    throw new CustomAPIError("Authentication Invalid", StatusCodes.BAD_REQUEST);
  }
};
const checkTestUser = async (req, res, next) => {
  if (req.user.testUser) {
    throw new CustomAPIError("Demo user. Read only!", StatusCodes.BAD_REQUEST);
  }
  next();
};
const authorizedUserMiddleware = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      throw new CustomAPIError(
        "Not authorized to access",
        StatusCodes.UNAUTHORIZED
      );
    }
    next(); /// we return an async function
  };
};

module.exports = { authMiddleware, authorizedUserMiddleware, checkTestUser };
