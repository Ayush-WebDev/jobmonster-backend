const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: ["Please provide the user name"],
    },
    lastName: {
      type: String,
      required: ["Please provide the user name"],
    },
    email: {
      type: String,
      required: ["Please provide the user name"],
    },
    password: {
      type: String,
      required: ["Please provide the user name"],
    },
    location: {
      type: String,
    },
    roles: {
      type: String,
      enum: {
        values: ["admin", "user"],
        required: "{VALUE} is required",
      },
    },
    avatar: {
      type: String,
    },
    avatarPublicId: {
      type: String,
    },
    verificationToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDate: {
      type: Date,
    },
    passwordToken: {
      type: String,
    },
    passwordTokenExpirationDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.modifiedPaths().includes("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (userPass) {
  const isPassword = await bcrypt.compare(userPass, this.password);
  return isPassword;
};

userSchema.methods.generateJWT = async function (payload) {
  const token = await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const User = mongoose.model("users", userSchema);

module.exports = User;
