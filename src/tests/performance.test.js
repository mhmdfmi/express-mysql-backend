const cache = require("../utils/cache");
const request = require("supertest");
const app = require("../app");
const path = require("path");
const fs = require("fs");
const uploadsDir = path.join(__dirname, "../../uploads");

// Helper function to get CSRF token and cookie jar
async function getCsrfTokenAndCookie() {
  const res = await request(app).get("/api/v1/csrf-token");
  const csrfToken = res.body.csrfToken;
  const cookies = res.headers["set-cookie"];
  return { csrfToken, cookies };
}

beforeEach(() => {
  cache.flushAll();
});

describe("Performance Test: GET /api/v1/products", () => {
  const NUM_REQUESTS = 300; // jumlah request paralel

  it(`should handle ${NUM_REQUESTS} parallel requests under 5 seconds`, async () => {
    await request(app).get("/api/v1/products"); // pre-warm cache

    const start = Date.now();

    // Kirim banyak request paralel
    const responses = await Promise.all(
      Array.from({ length: NUM_REQUESTS }).map(() =>
        request(app).get("/api/v1/products")
      )
    );

    const duration = Date.now() - start;

    // Semua response harus 200
    responses.forEach((res) => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("statusCode", 200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    expect(duration).toBeLessThan(5000);
    console.log(
      `Handled GET Products ${NUM_REQUESTS} requests in ${duration} ms`
    );
  }, 20000);
});

describe("Performance Test: GET /api/v1/users", () => {
  const NUM_REQUESTS = 300;

  it(`should handle ${NUM_REQUESTS} parallel requests under 5 seconds`, async () => {
    await request(app).get("/api/v1/users?page=1&pageSize=20"); // pre-warm cache

    const start = Date.now();

    const responses = await Promise.all(
      Array.from({ length: NUM_REQUESTS }).map(() =>
        request(app).get("/api/v1/users")
      )
    );

    const duration = Date.now() - start;

    responses.forEach((res) => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("statusCode", 200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    expect(duration).toBeLessThan(5000);
    console.log(`Handled GET Users ${NUM_REQUESTS} requests in ${duration} ms`);
  }, 20000);
});

describe("Performance Test: POST /api/v1/users/auth/login", () => {
  const NUM_REQUESTS = 100;
  const loginData = { email: "john@example.com", password: "password123" };

  it(`should handle ${NUM_REQUESTS} parallel logins under 5 seconds`, async () => {
    const { csrfToken, cookies } = await getCsrfTokenAndCookie();

    const start = Date.now();
    const responses = await Promise.all(
      Array.from({ length: NUM_REQUESTS }).map(() =>
        request(app)
          .post("/api/v1/users/auth/login")
          .set("Cookie", cookies)
          .set("csrf-token", csrfToken)
          .send(loginData)
      )
    );
    const duration = Date.now() - start;
    responses.forEach((res) => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });
    expect(duration).toBeLessThan(5000);
    console.log(
      `Handled POST login ${NUM_REQUESTS} requests in ${duration} ms`
    );
  });
});

describe("Performance Test: POST /api/v1/users/auth/register", () => {
  const NUM_REQUESTS = 100;
  it(`should handle ${NUM_REQUESTS} parallel registrations under 3 seconds`, async () => {
    const { csrfToken, cookies } = await getCsrfTokenAndCookie();

    const start = Date.now();
    const responses = await Promise.all(
      Array.from({ length: NUM_REQUESTS }).map((_, i) =>
        request(app)
          .post("/api/v1/users/auth/register")
          .set("Cookie", cookies)
          .set("csrf-token", csrfToken)
          .send({
            name: `TestUser${i}`,
            email: `testuser${Date.now()}${i}@mail.com`,
            password: "password123",
          })
      )
    );
    const duration = Date.now() - start;
    responses.forEach((res) => {
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("statusCode", 201);
      expect(res.body).toHaveProperty("data");
    });
    expect(duration).toBeLessThan(3000);
    console.log(
      `Handled POST register ${NUM_REQUESTS} requests in ${duration} ms`
    );
  });
});

describe("Performance Test: POST & DELETE /api/v1/products", () => {
  const NUM_REQUESTS = 100;

  it(`should handle ${NUM_REQUESTS} parallel product creations under 3 seconds`, async () => {
    const { csrfToken, cookies } = await getCsrfTokenAndCookie();

    const start = Date.now();
    const responses = await Promise.all(
      Array.from({ length: NUM_REQUESTS }).map((_, i) =>
        request(app)
          .post("/api/v1/products")
          .set("Cookie", cookies)
          .set("csrf-token", csrfToken)
          .send({
            name: `Product${i}`,
            price: "1000.00",
            description: "Performance test product",
          })
      )
    );
    const duration = Date.now() - start;
    responses.forEach((res) => {
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("statusCode", 201);
      expect(res.body).toHaveProperty("data");
    });
    expect(duration).toBeLessThan(3000);
    console.log(
      `Handled POST products ${NUM_REQUESTS} requests in ${duration} ms`
    );
  });

  it(`should handle ${NUM_REQUESTS} parallel product deletions under 3 seconds`, async () => {
    const { csrfToken, cookies } = await getCsrfTokenAndCookie();

    // Buat produk dulu untuk dihapus
    const createResponses = await Promise.all(
      Array.from({ length: NUM_REQUESTS }).map((_, i) =>
        request(app)
          .post("/api/v1/products")
          .set("Cookie", cookies)
          .set("csrf-token", csrfToken)
          .send({
            name: `DeleteMe${i}`,
            price: "100.00",
            description: "To be deleted",
          })
      )
    );
    const productIds = createResponses.map((res) => res.body.data.id);

    const start = Date.now();
    const responses = await Promise.all(
      productIds.map((id) =>
        request(app)
          .delete(`/api/v1/products/${id}`)
          .set("Cookie", cookies)
          .set("csrf-token", csrfToken)
      )
    );
    const duration = Date.now() - start;
    responses.forEach((res) => {
      expect([200, 204]).toContain(res.statusCode);
    });
    expect(duration).toBeLessThan(3000);
    console.log(
      `Handled DELETE products ${NUM_REQUESTS} requests in ${duration} ms`
    );
  });
});

describe("Performance Test: POST /api/v1/products (upload image)", () => {
  const NUM_REQUESTS = 10; // upload file, jangan terlalu besar

  it(`should handle ${NUM_REQUESTS} parallel product creations with image under 5 seconds`, async () => {
    const { csrfToken, cookies } = await getCsrfTokenAndCookie();
    const imagePath = path.join(__dirname, "../../uploads/default.jpg");
    const start = Date.now();
    const responses = await Promise.all(
      Array.from({ length: NUM_REQUESTS }).map((_, i) =>
        request(app)
          .post("/api/v1/products")
          .set("Cookie", cookies)
          .set("csrf-token", csrfToken)
          .set("Content-Type", "multipart/form-data")
          .field("name", `ProductImg${i}`)
          .field("price", "1000.00")
          .field("description", "Performance test product with image")
          .attach("image", imagePath)
      )
    );
    const duration = Date.now() - start;
    responses.forEach((res) => {
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("statusCode", 201);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("image_url");
      expect(typeof res.body.data.image_url).toBe("string");
    });
    expect(duration).toBeLessThan(5000);
    console.log(
      `Handled POST products with image ${NUM_REQUESTS} requests in ${duration} ms`
    );
  });
});

describe("Performance Test: PUT /api/v1/products/:id (upload image)", () => {
  const NUM_REQUESTS = 10;

  it(`should handle ${NUM_REQUESTS} parallel product updates with image under 5 seconds`, async () => {
    const { csrfToken, cookies } = await getCsrfTokenAndCookie();
    const imagePath = path.join(__dirname, "../../uploads/default.jpg");
    // Buat produk dulu untuk diupdate
    const createResponses = await Promise.all(
      Array.from({ length: NUM_REQUESTS }).map((_, i) =>
        request(app)
          .post("/api/v1/products")
          .set("Cookie", cookies)
          .set("csrf-token", csrfToken)
          .send({
            name: `ToUpdate${i}`,
            price: "100.00",
            description: "To be updated",
          })
      )
    );
    const productIds = createResponses.map((res) => res.body.data.id);

    const start = Date.now();
    const responses = await Promise.all(
      productIds.map((id, i) =>
        request(app)
          .put(`/api/v1/products/${id}`)
          .set("Cookie", cookies)
          .set("csrf-token", csrfToken)
          .set("Content-Type", "multipart/form-data")
          .field("name", `UpdatedProduct${i}`)
          .field("price", "200.00")
          .field("description", "Updated with image")
          .attach("image", imagePath)
      )
    );
    const duration = Date.now() - start;
    responses.forEach((res) => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("statusCode", 200);
    });
    expect(duration).toBeLessThan(5000);
    console.log(
      `Handled PUT products with image ${NUM_REQUESTS} requests in ${duration} ms`
    );
  });
});

describe("Performance Test: GET /api/v1/users/all", () => {
  it("should return all users without pagination", async () => {
    const res = await request(app).get("/api/v1/users/all");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("statusCode", 200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    // Optional: cek jumlah user jika ingin
    // expect(res.body.data.length).toBeGreaterThan(0);
    console.log(`GET /users/all returned ${res.body.data.length} users`);
  });
});

describe("Performance Test: GET /api/v1/products/all", () => {
  it("should return all products without pagination", async () => {
    const res = await request(app).get("/api/v1/products/all");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("statusCode", 200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    // Optional: cek jumlah produk jika ingin
    // expect(res.body.data.length).toBeGreaterThan(0);
    console.log(`GET /products/all returned ${res.body.data.length} products`);
  });
});

afterAll(async () => {
  // Hapus file dengan pola (number)-default.jpg saja
  try {
    const files = fs.readdirSync(uploadsDir);
    files.forEach((file) => {
      // Regex: hanya hapus file seperti 12345-default.jpg
      if (/^\d+-default\.jpg$/.test(file)) {
        fs.unlinkSync(path.join(uploadsDir, file));
      }
    });
  } catch (err) {
    console.error("Error cleaning uploads folder:", err);
  }

  const pool = require("../config/database");
  if (typeof pool.end === "function") {
    await pool.end();
  }
  await new Promise((r) => setTimeout(r, 500)); // delay 0.5 detik
});
