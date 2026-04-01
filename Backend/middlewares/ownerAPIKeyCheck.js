// middleware/apiKeyAuth.js
const Owner = require("../models/Owner.js");

const authApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }

    const owner = await Owner.findByApiKey(apiKey); // uses model, not raw pool
    if (!owner) {
      return res.status(403).json({ error: "Invalid API key" });
    }

    req.owner = owner; // ✅ consistent with req.owner.id used in controllers
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authApiKey };
