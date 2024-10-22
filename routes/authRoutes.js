const express = require("express");
const authRouter = express.Router();
const {
  validateUserRegister,
  validateLogin,
  validateEmailToken,
  validateUserUpdate,
} = require("../middlewares/validators");
const {
  register,
  login,
  currentUser,
  updateUser,
  forgotPassword,
  verifyEmail,
  logout,
  getApplicationStats,
} = require("../controllers/authController");
const {
  authMiddleware,
  authorizedUserMiddleware,
  checkTestUser,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerMiddleware");

//**We need to add proxy to connect backend with frontend as it is important to have server and frontend on the same server */
//** also because we are sending cookies and cookie can only be send with same domains */

authRouter.route("/register").post(validateUserRegister, register);
authRouter.route("/login").post(validateLogin, login);
authRouter.route("/forgot-password").post(forgotPassword);
authRouter
  .route("/update-user")
  .patch(
    authMiddleware,
    checkTestUser,
    upload.single("avatar"),
    validateUserUpdate,
    updateUser
  );
authRouter.route("/profile").get(authMiddleware, currentUser);
authRouter.route("/verify-email").post(validateEmailToken, verifyEmail);
authRouter
  .route("/getstats")
  .get(
    authMiddleware,
    checkTestUser,
    authorizedUserMiddleware("admin"),
    getApplicationStats
  );
authRouter.route("/logout").get(logout);
authRouter.route("/test").get((req, res) => {
  res.json({ msg: "test route" });
});
module.exports = authRouter;
