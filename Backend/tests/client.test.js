jest.setTimeout(15000); // ✅ increase timeout to 15 seconds

// ✅ mock sendEmail so no real email is sent during tests
jest.mock("../utils/sendEmail", () => ({
  sendMail: jest.fn().mockResolvedValue(true),
  sendInviteEmail: jest.fn().mockResolvedValue(true),
}));
const request = require("supertest");
const app = require("../app");
const poolPromise = require("../config/db"); // ✅ no await here at top level

const clientData = {
  name: "Test User",
  email: "user@test.com",
  password: "User@1234",
};

let apiKey;
let sessionToken;

beforeAll(async () => {
  const pool = await poolPromise; // ✅ await inside async function

  // register owner
  await request(app).post("/api/owner/register").send({
    name: "Test Owner",
    email: "owner@test.com",
    password: "Test@1234",
  });

  // manually verify owner email
  await pool.query("UPDATE owners SET email_verified = 1 WHERE email = ?", [
    "owner@test.com",
  ]);

  // login to get apiKey
  const res = await request(app)
    .post("/api/owner/login")
    .send({ email: "owner@test.com", password: "Test@1234" });

  apiKey = res.body.owner.api_key;
});

describe("Client Auth", () => {
  describe("POST /api/client/register", () => {
    it("should register successfully", async () => {
      const res = await request(app)
        .post("/api/client/register")
        .set("x-api-key", apiKey)
        .send(clientData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("userId");
    });

    it("should reject duplicate email", async () => {
      const res = await request(app)
        .post("/api/client/register")
        .set("x-api-key", apiKey)
        .send(clientData);

      expect(res.status).toBe(409);
    });

    it("should reject invalid api key", async () => {
      const res = await request(app)
        .post("/api/client/register")
        .set("x-api-key", "fake-key")
        .send(clientData);

      expect(res.status).toBe(403);
    });

    it("should reject missing api key", async () => {
      const res = await request(app)
        .post("/api/client/register")
        .send(clientData);

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/client/login", () => {
    it("should reject unverified email", async () => {
      const res = await request(app)
        .post("/api/client/login")
        .set("x-api-key", apiKey)
        .send({ email: clientData.email, password: clientData.password });

      expect(res.status).toBe(403);
    });

    it("should login after email verified", async () => {
      const pool = await poolPromise;
      await pool.query(
        "UPDATE client_users SET email_verified = 1 WHERE email = ?",
        [clientData.email],
      );

      const res = await request(app)
        .post("/api/client/login")
        .set("x-api-key", apiKey)
        .send({ email: clientData.email, password: clientData.password });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      sessionToken = res.body.token;
    });

    it("should reject wrong password", async () => {
      const res = await request(app)
        .post("/api/client/login")
        .set("x-api-key", apiKey)
        .send({ email: clientData.email, password: "wrongpass" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/client/logout", () => {
    it("should logout successfully", async () => {
      const res = await request(app)
        .post("/api/client/logout")
        .set("x-api-key", apiKey)
        .set("x-session-token", sessionToken);

      expect(res.status).toBe(200);
    });

    it("should reject already logged out token", async () => {
      const res = await request(app)
        .post("/api/client/logout")
        .set("x-api-key", apiKey)
        .set("x-session-token", sessionToken);

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/client/forgot-password", () => {
    it("should always return same message", async () => {
      const res = await request(app)
        .post("/api/client/forgot-password")
        .set("x-api-key", apiKey)
        .send({ email: clientData.email });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(
        "If that email exists, a reset link was sent.",
      );
    });
  });
});

afterAll(async () => {
  const pool = await poolPromise;
  await pool.query("DELETE FROM client_sessions");
  await pool.query("DELETE FROM client_users WHERE email = ?", [
    "user@test.com",
  ]);
  await pool.query("DELETE FROM owners WHERE email = ?", ["owner@test.com"]);
  await pool.end();
});
