const generateJWT = require("./generateJWT");

const attachcookie = async (res, tokenUser, refreshToken) => {
  const accessToken = await generateJWT(tokenUser);
  const refreshTokenJWT = await generateJWT({ tokenUser, refreshToken });
  const shortExp = new Date(Date.now() + 1000 * 60);
  const longExp = new Date(Date.now() + 1000 * 60 * 60 * 24);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    signed: true,
    secure: process.env.NODE_ENV === "production",
    expires: shortExp,
  });
  res.cookie("refreshTokenJWT", refreshTokenJWT, {
    httpOnly: true,
    signed: true,
    secure: process.env.NODE_ENV === "production",
    expires: longExp,
  });
};

module.exports = attachcookie;
