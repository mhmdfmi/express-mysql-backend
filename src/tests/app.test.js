const request = require("supertest");
const app = require("../app");

describe("🔍 App Endpoints", () => {
  it("GET / should return landing page", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Backend API/i);
  });

  it("GET /docs should return docs page", async () => {
    const res = await request(app).get("/docs");
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/API/i);
  });

  it("GET /api/v1/csrf-token should return a CSRF token", async () => {
    const agent = request.agent(app); // gunakan agent agar session bertahan
    const res = await agent.get("/api/v1/csrf-token");
    expect(res.statusCode).toBe(200);
    expect(res.body.csrfToken).toBeDefined();
  });

  it("POST /api/v1/some-route should reject without CSRF token", async () => {
    const res = await request(app)
      .post("/api/v1/users") // ganti dengan route yang kamu punya
      .send({ username: "hacker" });

    // asumsikan route dilindungi CSRF
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/Token CSRF/i);
  });
});

afterAll(async () => {
  const pool = require("../config/database");
  if (typeof pool.end === "function") {
    await pool.end();
  }
});
