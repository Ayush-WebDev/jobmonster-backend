const express = require("express");
const {
  getAllJobs,
  createJob,
  getSingleJob,
  updateJob,
  deleteJob,
  getJobStats,
} = require("../controllers/jobControllers");
const {
  validateValues,
  validateParams,
  validateJobUpdate,
} = require("../middlewares/validators");
const { checkTestUser } = require("../middlewares/authMiddleware");

const jobRouter = express.Router();

jobRouter
  .route("/")
  .get(getAllJobs)
  .post(validateValues, checkTestUser, createJob);
jobRouter.route("/stats").get(getJobStats);
//jobRouter.route("/upload-all").post(bulkUpload);

jobRouter
  .route("/:id")
  .get(validateParams, checkTestUser, getSingleJob)
  .patch(validateParams, validateJobUpdate, checkTestUser, updateJob)
  .delete(validateParams, checkTestUser, deleteJob);

module.exports = jobRouter;
