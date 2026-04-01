const poolPromise = require("../config/db");

// Whitelist of columns allowed in updates
const ALLOWED_UPDATE_FIELDS = new Set([
  "name",
  "email",
  "password",
  "email_verified",
]);

module.exports = {
  create: async ({ name, email, password, apiKey }) => {
    const pool = await poolPromise;
    const [result] = await pool.query(
      "INSERT INTO owners (name, email, password, api_key, email_verified) VALUES (?, ?, ?, ?, 0)",
      [name, email, password, apiKey],
    );
    return result;
  },

  findByEmail: async (email) => {
    const pool = await poolPromise;
    const [rows] = await pool.query("SELECT * FROM owners WHERE email = ?", [
      email,
    ]);
    return rows[0] || null; // return single owner or null
  },

  findByApiKey: async (apiKey) => {
    const pool = await poolPromise;
    const [rows] = await pool.query("SELECT * FROM owners WHERE api_key = ?", [
      apiKey,
    ]);
    return rows[0] || null; // return single owner or null
  },

  findById: async (id) => {
    const pool = await poolPromise;
    const [rows] = await pool.query(
      "SELECT id, name, email, api_key, email_verified, created_at FROM owners WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  },

  updateById: async (id, updateData) => {
    const pool = await poolPromise;

    // Prevent SQL injection — only allow whitelisted columns
    const safeFields = Object.keys(updateData).filter((key) =>
      ALLOWED_UPDATE_FIELDS.has(key),
    );

    if (safeFields.length === 0) throw new Error("No valid fields to update");

    const fields = safeFields.map((key) => `${key} = ?`).join(", ");
    const values = safeFields.map((key) => updateData[key]);
    values.push(id);

    const [result] = await pool.query(
      `UPDATE owners SET ${fields} WHERE id = ?`,
      values,
    );
    return result;
  },
};
