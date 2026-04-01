const poolPromise = require("../config/db.js");
const crypto = require("crypto");

// Hash the token before storing — never store raw tokens in DB
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

module.exports = {
  // Call this after successful login
  create: async ({ clientUserId, ownerId, token, expiresAt }) => {
    const pool = await poolPromise;

    const [result] = await pool.query(
      `INSERT INTO client_sessions
        (client_user_id, owner_id, token_hash, expires_at)
       VALUES (?, ?, ?, ?)`,
      [clientUserId, ownerId, hashToken(token), expiresAt],
    );
    return result;
  },

  // Call this on every protected request to validate the token
  findByToken: async (token, ownerId) => {
    const pool = await poolPromise;
    const [rows] = await pool.query(
      `SELECT * FROM client_sessions
       WHERE token_hash = ?
         AND owner_id = ?
         AND expires_at > NOW()`,
      [hashToken(token), ownerId],
    );
    return rows[0] || null;
  },

  // Call this on logout — delete that specific session
  deleteByToken: async (token, ownerId) => {
    const pool = await poolPromise;
    const [result] = await pool.query(
      `DELETE FROM client_sessions
       WHERE token_hash = ? AND owner_id = ?`,
      [hashToken(token), ownerId],
    );
    return result;
  },

  // Logout from all devices — delete all sessions for a user
  deleteAllByUser: async (clientUserId, ownerId) => {
    const pool = await poolPromise;
    const [result] = await pool.query(
      `DELETE FROM client_sessions
       WHERE client_user_id = ? AND owner_id = ?`,
      [clientUserId, ownerId],
    );
    return result;
  },

  // Run this periodically (cron job) to keep the table clean
  deleteExpired: async () => {
    const pool = await poolPromise;
    const [result] = await pool.query(
      `DELETE FROM client_sessions WHERE expires_at <= NOW()`,
    );
    return result;
  },
};
