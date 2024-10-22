const express = require("express");
const { homepage } = require("../controllers/mainController");
const mainRouter = express.Router();

mainRouter.route("/").get(homepage);

module.exports = mainRouter;
