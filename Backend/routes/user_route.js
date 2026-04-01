const express = require("express");
const router = express.Router();
const { authApiKey: apiKeyAuth } = require("../middlewares/ownerAPIKeyCheck");
const {
  verifyEmail,
  login,
  register,
  forgotPassword,
  resetPassword,
  setPassword,
  logout,
} = require("../controller/userController");

router.post("/register", apiKeyAuth, register); // API key protected
router.post("/login", apiKeyAuth, login); // API key protected
router.post("/logout", apiKeyAuth, logout); // API key protected
router.post("/forgot-password", apiKeyAuth, forgotPassword);
router.post("/reset-password", resetPassword); // uses JWT token in body
router.get("/verify-email", verifyEmail);

module.exports = router;
