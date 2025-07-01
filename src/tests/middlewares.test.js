jest.mock("../config/database", () => ({
  promise: () => ({
    query: jest.fn().mockResolvedValue([[]]),
  }),
}));

const authMiddleware = require("../middlewares/auth.middleware");
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/user.repository");
const isAdmin = require("../middlewares/isAdmin.middleware");

jest.mock("jsonwebtoken");
jest.mock("../repositories/user.repository");

describe("auth.middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { header: jest.fn() };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    process.env.JWT_SECRET = "secret";
  });

  it("should auto-pass and inject user in test mode", async () => {
    process.env.NODE_ENV = "test";
    await authMiddleware(req, res, next);
    expect(req.user).toEqual({
      id: 1,
      email: "ucoxadmin@example.com",
      role: "admin",
      name: "Ucox Admin",
    });
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if no token", async () => {
    process.env.NODE_ENV = "production";
    req.header.mockReturnValue(undefined);
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  it("should return 401 if token invalid", async () => {
    process.env.NODE_ENV = "production";
    req.header.mockReturnValue("Bearer invalidtoken");
    jwt.verify.mockImplementation(() => {
      throw new Error("bad token");
    });
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
  });

  it("should return 401 if user not found", async () => {
    process.env.NODE_ENV = "production";
    req.header.mockReturnValue("Bearer validtoken");
    jwt.verify.mockReturnValue({ id: 123 });
    UserRepository.prototype.findById.mockResolvedValue(null);
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  it("should inject user and call next if valid", async () => {
    process.env.NODE_ENV = "production";
    req.header.mockReturnValue("Bearer validtoken");
    jwt.verify.mockReturnValue({ id: 123 });
    const user = { id: 123, email: "a@mail.com" };
    UserRepository.prototype.findById.mockResolvedValue(user);
    await authMiddleware(req, res, next);
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalled();
  });
});

describe("isAdmin.middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should call next if user is admin", () => {
    req.user.role = "admin";
    isAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should return 403 if user is not admin", () => {
    req.user.role = "user";
    isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin access required" });
  });

  it("should return 403 if user is missing", () => {
    req.user = undefined;
    isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin access required" });
  });
});

afterAll(async () => {
  const pool = require("../config/database");
  if (typeof pool.end === "function") {
    await pool.end();
  }
});
