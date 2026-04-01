const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config({ quiet: true });

require("./config/db");
const ownerRoutes = require("./routes/owner_route.js");
const clientRoutes = require("./routes/user_route.js");
const errorHandler = require("./middlewares/errorHandeler.js");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);
// Stricter limiter — auth routes only
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use("/api/client/login", authLimiter);
app.use("/api/client/register", authLimiter);
app.use("/api/client/forgot-password", authLimiter);
app.use("/api/owner/login", authLimiter);
app.use("/api/owner/register", authLimiter);

// Routes
app.use("/api/owner", ownerRoutes);
app.use("/api/client", clientRoutes);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
