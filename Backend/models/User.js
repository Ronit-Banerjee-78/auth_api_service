const poolPromise = require("../config/db");

// Whitelist of columns allowed in updates
const ALLOWED_UPDATE_FIELDS = new Set([
  "name",
  "email",
  "password",
  "phone",
  "address",
  "email_verified",
]);

module.exports = {
  create: async ({ ownerId, name, email, password, phone, address }) => {
    const pool = await poolPromise;
    const [result] = await pool.query(
      `INSERT INTO client_users
        (owner_id, name, email, password, phone, address, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [ownerId, name, email, password, phone || null, address || null],
    );
    return result;
  },

  // ✅ Scoped by owner_id — required after composite unique fix
  findByEmail: async (email, ownerId) => {
    const pool = await poolPromise;
    const [rows] = await pool.query(
      "SELECT * FROM client_users WHERE email = ? AND owner_id = ?",
      [email, ownerId],
    );
    return rows[0] || null;
  },

  findById: async (id, ownerId) => {
    const pool = await poolPromise;
    const [rows] = await pool.query(
      "SELECT * FROM client_users WHERE id = ? AND owner_id = ?",
      [id, ownerId],
    );
    return rows[0] || null;
  },

  // Get all users belonging to an owner
  findAllByOwner: async (ownerId) => {
    const pool = await poolPromise;
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, address, email_verified, created_at FROM client_users WHERE owner_id = ?",
      [ownerId],
    );
    return rows;
  },

  updateById: async (id, ownerId, updateData) => {
    const pool = await poolPromise;

    // Prevent SQL injection — only allow whitelisted columns
    const safeFields = Object.keys(updateData).filter((key) =>
      ALLOWED_UPDATE_FIELDS.has(key),
    );

    if (safeFields.length === 0) throw new Error("No valid fields to update");

    const fields = safeFields.map((key) => `${key} = ?`).join(", ");
    const values = safeFields.map((key) => updateData[key]);
    values.push(id, ownerId);

    const [result] = await pool.query(
      `UPDATE client_users SET ${fields} WHERE id = ? AND owner_id = ?`,
      values,
    );
    return result;
  },

  deleteById: async (id, ownerId) => {
    const pool = await poolPromise;
    const [result] = await pool.query(
      "DELETE FROM client_users WHERE id = ? AND owner_id = ?",
      [id, ownerId],
    );
    return result;
  },
};
