const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Client = require("../models/User.js");
const Session = require("../models/session.js");
const { sendMail } = require("../utils/sendEmail.js");

// ✅ Owner import removed too — no longer needed here

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email and password are required" });
    }
    const ownerId = req.owner.id; // ✅ from authApiKey middleware

    const existing = await Client.findByEmail(email, ownerId);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await Client.create({
      ownerId,
      name,
      email,
      password: hash,
      phone,
      address,
    });

    const token = jwt.sign(
      { id: result.insertId, ownerId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );
    const verifyLink = `${process.env.API_URL}/api/client/verify-email?token=${token}`;
    await sendMail(email, "Verify your email", `Click here: ${verifyLink}`);

    return res.status(201).json({
      message: "User registered. Verification email sent.",
      userId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await Client.updateById(decoded.id, decoded.ownerId, { email_verified: 1 });
    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ownerId = req.owner.id; // ✅ from authApiKey middleware

    const client = await Client.findByEmail(email, ownerId);
    if (!client) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!client.email_verified) {
      return res.status(403).json({
        error: "Email not verified. Please verify before logging in.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await Session.create({
      clientUserId: client.id,
      ownerId,
      token,
      expiresAt,
    });

    const { password: _, ...clientData } = client;
    return res.status(200).json({
      token,
      client: clientData,
      message: "Login successful",
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.headers["x-session-token"];
    if (!token)
      return res.status(400).json({ error: "Session token required" });

    const result = await Session.deleteByToken(token, req.owner.id);
    if (result.affectedRows === 0) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const ownerId = req.owner.id; // ✅ from authApiKey middleware

    const client = await Client.findByEmail(email, ownerId);
    if (!client) {
      return res.json({
        message: "If that email exists, a reset link was sent.",
      });
    }

    const token = jwt.sign({ id: client.id, ownerId }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const resetLink = `${process.env.API_URL}/api/client/reset-password?token=${token}`;
    await sendMail(email, "Password Reset", `Click here: ${resetLink}`);

    return res.json({
      message: "If that email exists, a reset link was sent.",
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hash = await bcrypt.hash(newPassword, 10);
    await Client.updateById(decoded.id, decoded.ownerId, { password: hash });
    await Session.deleteAllByUser(decoded.id, decoded.ownerId);

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};
