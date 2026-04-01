const initDB = require("../config/db.js");

let pool;

beforeAll(async () => {
  pool = await initDB();
});

afterAll(async () => {
  // clean all test data after full run
  await pool.query("DELETE FROM client_sessions");
  await pool.query("DELETE FROM client_users");
  await pool.query("DELETE FROM owners");
  await pool.end();
});
