const { StatusCodes } = require("http-status-codes");
const Job = require("../model/jobModel");
const CustomAPIError = require("../custom-error/customError");
const mockData = require("../utils/mockData");
const User = require("../model/userModel");
const { default: mongoose } = require("mongoose");
const dayjs = require("dayjs");

const getAllJobs = async (req, res, next) => {
  console.log(req.query);
  const { search, jobStatus, jobType, sort } = req.query;
  let queryJob = {
    createdBy: req.user.userId,
  };
  if (search) {
    queryJob.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }
  if (jobStatus && jobStatus !== "all") {
    queryJob.jobStatus = jobStatus;
  }
  if (jobType && jobType !== "all") {
    queryJob.jobType = jobType;
  }
  const sortQuery = {
    newest: "createdAt",
    oldest: "-createdAt",
    "a-z": "title",
    "z-a": "-title",
  };

  const sortOption = sortQuery[sort] || sortQuery.newest;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  let jobs = await Job.find(queryJob).sort(sortOption).skip(skip).limit(limit);
  let count = await Job.countDocuments(queryJob);
  const pages = Math.ceil(count / limit);
  if (!jobs || jobs.length < 1) {
    jobs = [];
  }
  res.status(StatusCodes.OK).json({
    msg: "Success",
    jobs,
    count,
    currentPage: page,
    totalPages: pages,
  });
};

const getSingleJob = async (req, res, next) => {
  const job = await Job.find({ _id: req.params.id });
  res.status(StatusCodes.OK).json({ msg: "Success", job, user: req.user });
};

const createJob = async (req, res, next) => {
  const { company, jobStatus, title, jobType, jobLocation } = req.body;
  const job = await Job.create({
    company,
    jobStatus,
    title,
    jobType,
    jobLocation,
    createdBy: req.user.userId,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Job created successfully", job });
};

const updateJob = async (req, res, next) => {
  const { id } = req.params;
  console.log(req.body);

  const job = await Job.findOneAndUpdate({ _id: id }, { ...req.body });
  await job.save();
  res.status(StatusCodes.OK).json({ msg: "Success", job });
};

///**Get jobs stats */

/// As the value of the userId is string so we convert it to mongoose user Id
const getJobStats = async (req, res) => {
  const stats = await Job.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(req.user.userId),
      },
    },
    { $group: { _id: "$jobStatus", count: { $sum: 1 } } },
  ]);
  const statsObj = stats.reduce((acc, stat) => {
    const { _id: title, count } = stat;
    acc[title] = count;
    return acc;
  }, {});

  let monthlyApplications = Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: {
            $month: "$createdAt",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);
  let monthlyStats = (await monthlyApplications).map((stat) => {
    const {
      _id: { year, month },
      count,
    } = stat;
    const date = dayjs()
      .month(month - 1)
      .year(year)
      .format("MMM YY");
    return { date, count };
  });

  const defaultState = {
    pending: statsObj.pending || 0,
    interview: statsObj.interview || 0,
    rejected: statsObj.rejected || 0,
  };
  res.status(StatusCodes.OK).json({
    msg: "Success",
    applications: defaultState,
    monthlyStats,
  });
};

const deleteJob = async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findOneAndDelete({ _id: id });
  res.status(StatusCodes.OK).json({ msg: "Success" });
};

///** Bulk upload mock data *///

// const bulkUpload = async (req, res) => {
//   const user = await User.findOne({ email: "test@test13.com" });
//   await Job.deleteMany({ createdBy: user._id });
//   const data = mockData.map((job) => {
//     return { ...job, createdBy: user._id };
//   });
//   await Job.create(data);
//   console.log("success");
//   process.exit(0);
// };

module.exports = {
  getAllJobs,
  getSingleJob,
  createJob,
  updateJob,
  deleteJob,
  getJobStats,
};
