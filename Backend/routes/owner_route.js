const express = require("express");
const router = express.Router();
const { jwtAuth: ownerAuth } = require("../middlewares/jwtAuth");
const {
  register,
  login,
  verifyEmail,
  getUsers,
  updateUser,
  getAPIKey,
} = require("../controller/ownerController");

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.get("/api-key", ownerAuth, getAPIKey); // JWT protected
router.get("/users", ownerAuth, getUsers); // JWT protected
router.put("/users/:id", ownerAuth, updateUser); // JWT protected
module.exports = router;
