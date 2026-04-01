jest.setTimeout(15000); // ✅ increase timeout to 15 seconds

// ✅ mock sendEmail so no real email is sent during tests
jest.mock("../utils/sendEmail", () => ({
  sendMail: jest.fn().mockResolvedValue(true),
  sendInviteEmail: jest.fn().mockResolvedValue(true),
}));
const request = require("supertest");
const app = require("../app");
const poolPromise = require("../config/db"); // ✅ add this
const ownerData = {
  name: "Test Owner",
  email: "owner@test.com",
  password: "Test@1234",
};

let ownerToken;
let apiKey;

describe("Owner Auth", () => {
  describe("POST /api/owner/register", () => {
    it("should register successfully", async () => {
      const res = await request(app)
        .post("/api/owner/register")
        .send(ownerData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("apiKey");
      apiKey = res.body.apiKey;

      // ✅ manually verify email so login works
      const pool = await poolPromise;
      await pool.query("UPDATE owners SET email_verified = 1 WHERE email = ?", [
        ownerData.email,
      ]);
    });

    it("should reject duplicate email", async () => {
      const res = await request(app)
        .post("/api/owner/register")
        .send(ownerData);

      expect(res.status).toBe(409);
    });

    it("should reject missing fields", async () => {
      const res = await request(app)
        .post("/api/owner/register")
        .send({ email: "test@test.com" }); // no name or password

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/owner/login", () => {
    it("should login successfully", async () => {
      const res = await request(app)
        .post("/api/owner/login")
        .send({ email: ownerData.email, password: ownerData.password });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      ownerToken = res.body.token;
    });

    it("should reject wrong password", async () => {
      const res = await request(app)
        .post("/api/owner/login")
        .send({ email: ownerData.email, password: "wrongpassword" });

      expect(res.status).toBe(401);
    });

    it("should reject non-existent email", async () => {
      const res = await request(app)
        .post("/api/owner/login")
        .send({ email: "nobody@test.com", password: "Test@1234" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/owner/users", () => {
    it("should return users list", async () => {
      const res = await request(app)
        .get("/api/owner/users")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("users");
    });

    it("should reject missing token", async () => {
      const res = await request(app).get("/api/owner/users");
      expect(res.status).toBe(401);
    });

    it("should reject invalid token", async () => {
      const res = await request(app)
        .get("/api/owner/users")
        .set("Authorization", "Bearer faketoken");

      expect(res.status).toBe(401);
    });
  });
});
afterAll(async () => {
  const pool = await poolPromise;
  await pool.query("DELETE FROM owners WHERE email = ?", ["owner@test.com"]);
  await pool.end();
});
