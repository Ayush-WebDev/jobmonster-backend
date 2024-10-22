const { body, param, validationResult, query } = require("express-validator");
const CustomAPIError = require("../custom-error/customError");
const { StatusCodes } = require("http-status-codes");
const { JOB_TYPE, JOB_STATUS } = require("../utils/constants");
const { default: mongoose } = require("mongoose");
const Job = require("../model/jobModel");
const User = require("../model/userModel");

const withValidateErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMsgs = errors.array().map((err) => err.msg);
        if (errorMsgs[0].startsWith("no job")) {
          throw new CustomAPIError(errorMsgs, StatusCodes.NOT_FOUND);
        }
        throw new CustomAPIError(errorMsgs, StatusCodes.BAD_REQUEST);
      }
      next();
    },
  ];
};

/// The express-validator provides "body" and "validationResult" properties
/// The validation middleware has 2 parts: 1. Validation values - [body("string same as key for request")].notEmpty().withErrorMessage()///
// 2. Error response

const validateValues = withValidateErrors([
  body("title")
    .notEmpty()
    .withMessage("Please provide value")
    .isLength({ max: 30 })
    .withMessage("Maximum 30 characters"),
  body("company")
    .notEmpty()
    .withMessage("Please provide value")
    .isLength({ max: 30 })
    .withMessage("Maximum 30 characters"),
  body("jobStatus")
    .notEmpty()
    .withMessage("Please provide value")
    .isLength({ max: 30 })
    .withMessage("Maximum 30 characters"),
]);

/// Validate job input for update route

const validateJobUpdate = withValidateErrors([
  body("jobLocation").notEmpty().withMessage("Please provide location value"),
  body("jobType")
    .isIn(Object.values(JOB_TYPE))
    .withMessage("Invalid job type value"),
  body("jobStatus")
    .isIn(Object.values(JOB_STATUS))
    .withMessage("Invalid job status value"),
]);

//// To validate the id passed from params and check it is a valid mongo db id, we use custom function with callback

//// mongoose.Types.ObjectId.isValid(value) -- we can use to validate id

const validateParams = withValidateErrors([
  param("id").custom(async (val, { req }) => {
    const isValid = mongoose.Types.ObjectId.isValid(val);
    if (!isValid) {
      throw new Error("Invalid MongoDB id", 400);
    }
    const job = await Job.findOne({ _id: val });
    if (!job || job.length === 0)
      throw new Error(`no job found with id ${val}`, 404);
    const isAdmin = req.user.roles === "admin";
    const isOwner = req.user.userId === job.createdBy.toString(); ///convert to string
    if (!isAdmin && !isOwner)
      throw new Error("Unauthorized access", StatusCodes.UNAUTHORIZED);
  }),
]);

const validateUserRegister = withValidateErrors([
  body("firstName").notEmpty().withMessage("Please provide first name"),
  body("lastName").notEmpty().withMessage("Please provide last name"),
  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom(async (email) => {
      let user = await User.findOne({ email });
      if (user) {
        throw new CustomAPIError(
          "The email already exists, please use a different email",
          400
        );
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Please provide password")
    .isLength({ min: 8 })
    .withMessage("Minimum 8 characters"),
  body("location").notEmpty().withMessage("Please provide location"),
]);

const validateLogin = withValidateErrors([
  body("email")
    .notEmpty()
    .withMessage("Please provide email")
    .isEmail()
    .custom(async (email) => {
      let user = await User.findOne({ email });
      if (!user) {
        throw new CustomAPIError("No user with this email exists", 400);
      }
    }),
  body("password").notEmpty().withMessage("Please provide password"),
]);
const validateUserUpdate = withValidateErrors([
  body("lastName").notEmpty().withMessage("Please provide Last name"),
  body("location").notEmpty().withMessage("Please provide location"),
  body("firstName").notEmpty().withMessage("Please provide First name"),
  body("email")
    .notEmpty()
    .withMessage("Please provide email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ email: val });
      if (!user) throw new Error("Unauthorized", StatusCodes.UNAUTHORIZED);
      if (user && user._id.toString() !== req.user.userId)
        throw new Error("Bad request", StatusCodes.BAD_REQUEST);
    }),
]);

const validateEmailToken = withValidateErrors([
  body("token").notEmpty().withMessage("Token is not present"),
  body("email")
    .notEmpty()
    .withMessage("Email not present")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (!user) throw new Error("Email is invalid", StatusCodes.UNAUTHORIZED);
    }),
]);

module.exports = {
  validateValues,
  validateJobUpdate,
  validateParams,
  validateUserUpdate,
  validateUserRegister,
  validateLogin,
  validateEmailToken,
};
