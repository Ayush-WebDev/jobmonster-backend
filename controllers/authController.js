require("dotenv").config();
const { StatusCodes } = require("http-status-codes");
const User = require("../model/userModel");
const CustomAPIError = require("../custom-error/customError");
const attachcookie = require("../utils/cookie");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const createTokenUser = require("../utils/createTokenUser");
const Token = require("../model/token");
const Job = require("../model/jobModel");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

/** Register User **/
const register = async (req, res) => {
  const verificationToken = crypto.randomBytes(40).toString("hex");
  const origin = process.env.ORIGIN_NAME;
  // const newOrigin = 'https://react-node-user-workflow-front-end.netlify.app';

  // const tempOrigin = req.get('origin');
  // const protocol = req.protocol;
  // const host = req.get('host');
  // const forwardedHost = req.get('x-forwarded-host');
  // const forwardedProtocol = req.get('x-forwarded-proto');
  const { firstName, lastName, email, password, location } = req.body;
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    location,
    verificationToken,
    roles: "user",
  });
  const tokenUser = createTokenUser(user);
  const refreshToken = crypto.randomBytes(40).toString("hex");
  const ip = req.ip;
  const userAgent = req.get("user-agent"); // req.headers["user-agent"];
  const userToken = {
    refreshToken,
    ip,
    userAgent,
    user: user._id,
  };

  const refreshTokenNew = await Token.create({ ...userToken });

  // const token = await user.generateJWT({ userId: user._id, roles: user.roles });
  await attachcookie(res, tokenUser, refreshToken);
  await sendVerificationEmail({
    name: firstName,
    email,
    verificationToken,
    origin,
  });
  res.status(StatusCodes.CREATED).json({
    msg: "Please check your mail inbox for verification email",
  });
};

const verifyEmail = async (req, res) => {
  const { token, email } = req.body;
  //console.log(typeof token);
  const user = await User.findOne({ email });
  if (user.verificationToken !== token) {
    throw new CustomAPIError(
      "Authentication invalid",
      StatusCodes.UNAUTHORIZED
    );
  }
  user.isVerified = true;
  user.verificationToken = "";
  user.save();
  res.status(StatusCodes.OK).json({ msg: "Email verified successfully" });
};

/** Login User **/
const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const checkPass = user && (await user.comparePassword(req.body.password));
  if (!checkPass) {
    throw new CustomAPIError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }
  if (!user.isVerified) {
    throw new CustomAPIError("Please verify email", StatusCodes.UNAUTHORIZED);
  }
  const tokenUser = createTokenUser(user);
  let refreshToken = "";
  refreshToken = crypto.randomBytes(40).toString("hex");
  const ip = req.ip;
  const userAgent = req.get("user-agent"); // req.headers["user-agent"];
  const userToken = {
    refreshToken,
    ip,
    userAgent,
    user: user._id,
  };
  const refreshTokenNew = await Token.create({ ...userToken });

  //// Check for existing token

  const existingToken = await Token.findOne({ user: user._id });
  if (existingToken) {
    if (!existingToken.isValid) {
      throw new CustomAPIError("Invalid credentials", StatusCodes.UNAUTHORIZED);
    }
    await attachcookie(res, tokenUser, existingToken.refreshToken);
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }
  //const token = await user.generateJWT({ userId: user._id, roles: user.roles });
  await attachcookie(res, tokenUser, refreshToken);
  res.status(StatusCodes.OK).json({ msg: "Success", user });
};

/** Forgot password User **/
const forgotPassword = async (req, res) => {
  const user = await User.create(req.body);
  res.status(StatusCodes.OK).json({ msg: "Success", user });
};

/** Current User **/
const currentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  const tokenUserNew = createTokenUser(user);
  res.status(StatusCodes.OK).json({ msg: "Success", user: tokenUserNew });
};

/** Update Password User **/
const updateUser = async (req, res) => {
  const { firstName, lastName, location } = req.body;
  const updatedUser = { ...req.body };
  delete updatedUser.password;
  if (!firstName || !lastName || !location)
    throw new CustomAPIError(
      "Please provide necessary fields",
      StatusCodes.BAD_REQUEST
    );
  const file = req.file;
  if (file) {
    const response = await cloudinary.uploader.upload(req.file.path);
    fs.unlinkSync(req.file.path);
    //console.log(response, req.file);
    updatedUser.avatar = response.secure_url;
    updatedUser.avatarPublicId = response.public_id;
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { ...updatedUser, roles: "user" }
  );
  if (req.file && updatedUser.avatarPublicId) {
    await cloudinary.uploader.destroy(user.avatarPublicId);
  }
  if (!user)
    throw new CustomAPIError("Unauthorized access", StatusCodes.UNAUTHORIZED);

  res.status(StatusCodes.OK).json({ msg: "Success", user });
};

/** Logout User **/
const logout = async (req, res) => {
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshTokenJWT", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "User logged out" });
};

//** Get application stats */
const getApplicationStats = async (req, res) => {
  const users = await User.find({}).countDocuments();
  const jobs = await Job.find({}).countDocuments();
  res.status(StatusCodes.OK).json({
    msg: "Success",
    user: req.user,
    users,
    jobs,
  });
};

module.exports = {
  register,
  login,
  currentUser,
  updateUser,
  forgotPassword,
  verifyEmail,
  getApplicationStats,
  logout,
};
