const request = require("supertest");
const app = require("../app");

describe("App Endpoints", () => {
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
});

afterAll(async () => {
  const pool = require("../config/database");
  if (typeof pool.end === "function") {
    await pool.end();
  }
});
