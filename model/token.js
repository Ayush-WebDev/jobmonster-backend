const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    refreshToken: String,
    ip: String,
    userAgent: String,
    isValid: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Token = mongoose.model("tokens", tokenSchema);

module.exports = Token;
