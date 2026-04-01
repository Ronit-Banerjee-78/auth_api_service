const bcrypt = require("bcryptjs");
// const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const Owner = require("../models/Owner.js");
const Client = require("../models/User.js");
const { sendMail } = require("../utils/sendEmail.js");
const crypto = require("crypto");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email and password are required" });
    }
    const existing = await Owner.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const apiKey = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(password, 10);

    await Owner.create({ name, email, password: hash, apiKey });

    const owner = await Owner.findByEmail(email);
    if (!owner) throw new Error("Owner not found after registration");

    const token = jwt.sign({ id: owner.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const verifyLink = `${process.env.API_URL}/api/owner/verify-email?token=${token}`;

    await sendMail(email, "Verify your email", `Click here: ${verifyLink}`);

    return res.status(201).json({
      message: "Registered successfully. Verification email sent.",
      apiKey,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const owner = await Owner.findByEmail(email);
    if (!owner) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!owner.email_verified) {
      return res.status(403).json({
        error: "Email not verified. Please check your inbox.",
      });
    }

    const token = jwt.sign({ id: owner.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const { password: _, ...ownerData } = owner; // strip password

    return res
      .status(200)
      .json({ token, owner: ownerData, message: "Login successful" });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await Owner.updateById(decoded.id, { email_verified: 1 });

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getAPIKey = async (req, res, next) => {
  try {
    const owner = await Owner.findById(req.owner.id);
    if (!owner) return res.status(404).json({ error: "Owner not found" });

    return res.json({ api_key: owner.api_key });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await Client.findAllByOwner(req.owner.id);
    return res.json({ users });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    const result = await Client.updateById(userId, req.owner.id, updateData);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ message: "User updated successfully" });
  } catch (err) {
    next(err);
  }
};
