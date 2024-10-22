const mongoose = require("mongoose");
const { JOB_TYPE, JOB_STATUS, SORT_BUY } = require("../utils/constants");
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide job title"],
    },
    company: {
      type: String,
      required: [true, "Please provide job title"],
    },
    jobStatus: {
      type: String,
      enum: {
        values: Object.values(JOB_STATUS),
        required: "{VALUE} is required",
      },
      default: JOB_STATUS.PENDING,
    },
    jobType: {
      type: String,
      enum: {
        values: Object.values(JOB_TYPE),
        required: "{VALUE} is required",
      },
      default: JOB_TYPE.FULL_TIME,
    },
    jobLocation: {
      type: String,
      default: "new york",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("jobs", jobSchema);

module.exports = Job;
