// jobs/cleanupSessions.js
const session = require("../models/session.js");

const runCleanup = async () => {
  const result = await session.deleteExpired();
  console.log(`🧹 Cleaned up ${result.affectedRows} expired sessions`);
};

// Run every hour
setInterval(runCleanup, 60 * 60 * 1000);

module.exports = runCleanup;
