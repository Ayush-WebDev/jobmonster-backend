require("dotenv").config();
require("express-async-errors");
const express = require("express");
const dbConnection = require("./db/connect");
const mainRouter = require("./routes/mainRoute");
const jobRouter = require("./routes/jobRoutes");
const authRouter = require("./routes/authRoutes");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;
const errorHandlerMiddleware = require("./middlewares/errorHandler");
const notFoundMiddleware = require("./middlewares/notFound");
const { authMiddleware } = require("./middlewares/authMiddleware");
const configSettings = require("./utils/cloudinaryConfig");
const app = express();
const path = require("path");
// const route = path.resolve(__dirname, "/public", "index.html");
// console.log(route);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "./public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use("/api/v1/jobs", authMiddleware, jobRouter);
app.use("/api/v1/auth", authRouter);
// console.log(path.resolve("./public", "index.html"));

// We place all the files from distt folder in our server's public folder and have a route for the all the pages and render index.html
// app.use("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "./client/dist", "index.html"));
// });
app.use(notFoundMiddleware, errorHandlerMiddleware);
configSettings;
const start = async () => {
  try {
    await dbConnection(process.env.MONGO_URI_PATH);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
