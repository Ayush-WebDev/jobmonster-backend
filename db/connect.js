const mongoose = require("mongoose");
const dbConnection = (path) => {
  return mongoose.connect(path);
};

module.exports = dbConnection;
