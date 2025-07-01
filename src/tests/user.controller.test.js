const cache = require("../utils/cache");

beforeEach(() => {
  userController = new UserController();
  req = { body: {}, params: {}, user: { id: 1, role: "user" } };
  res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  cache.flushAll();
});

jest.mock("../config/database", () => ({
  promise: () => ({
    query: jest.fn().mockResolvedValue([[]]),
  }),
}));

const UserController = require("../controllers/user.controller");
const UserService = require("../services/user.service");

jest.mock("../services/user.service");

describe("UserController", () => {
  let userController, req, res;

  beforeEach(() => {
    userController = new UserController();
    req = { body: {}, params: {}, user: { id: 1, role: "user" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it("register success", async () => {
    UserService.prototype.register.mockResolvedValue({ id: 1, name: "A" });
    await userController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 201,
      message: "User registered successfully",
      data: { id: 1, name: "A" },
    });
  });

  it("register fail", async () => {
    UserService.prototype.register.mockRejectedValue(new Error("fail"));
    await userController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: "fail",
    });
  });

  it("login success", async () => {
    UserService.prototype.login.mockResolvedValue("token123");
    req.body = { email: "a@mail.com", password: "pw" };
    await userController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 200,
      message: "Login successful",
      data: { token: "token123" },
    });
  });

  it("login fail", async () => {
    UserService.prototype.login.mockRejectedValue(new Error("fail"));
    await userController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 401,
      message: "fail",
    });
  });

  it("getAllUsers success", async () => {
    req.query = { page: 1, pageSize: 20 };
    UserService.prototype.getAllUsers.mockResolvedValue([{ id: 1 }]);
    await userController.getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 200,
      message: "success",
      data: [{ id: 1 }],
    });
  });

  it("getAllUsers fail", async () => {
    req.query = { page: 1, pageSize: 20 };
    UserService.prototype.getAllUsers.mockRejectedValue(new Error("fail"));
    await userController.getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: "fail",
    });
  });

  describe("updateUser", () => {
    it("update self success", async () => {
      req.body = { name: "B", email: "b@mail.com", password: "pw" };
      req.params = {};
      UserService.prototype.updateUser.mockResolvedValue(true);
      await userController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        message: "User updated successfully",
      });
    });

    it("update self forbidden update role", async () => {
      req.body = { role: "admin" };
      req.params = {};
      await userController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: "You are not allowed to update your own role",
      });
    });

    it("update self not found", async () => {
      req.body = { name: "B" };
      req.params = {};
      UserService.prototype.updateUser.mockResolvedValue(false);
      await userController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: "User not found",
      });
    });

    it("admin update role of other user success", async () => {
      req.user.role = "admin";
      req.params = { id: 2 };
      req.body = { role: "user" };
      UserService.prototype.updateUser.mockResolvedValue(true);
      await userController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        message: "User's role updated successfully",
      });
    });

    it("admin forbidden update other fields", async () => {
      req.user.role = "admin";
      req.params = { id: 2 };
      req.body = { name: "X" };
      await userController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: "Admin can only update role of other users",
      });
    });

    it("admin update role not found", async () => {
      req.user.role = "admin";
      req.params = { id: 2 };
      req.body = { role: "user" };
      UserService.prototype.updateUser.mockResolvedValue(false);
      await userController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: "User not found",
      });
    });

    it("forbidden if not admin and update other user", async () => {
      req.user.role = "user";
      req.params = { id: 2 };
      req.body = { role: "admin" };
      await userController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: "Forbidden",
      });
    });
  });

  describe("deleteUser", () => {
    it("delete self success", async () => {
      req.user.role = "user";
      req.params = {};
      UserService.prototype.deleteUser.mockResolvedValue(true);
      await userController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        message: "User deleted successfully",
      });
    });

    it("delete self not found", async () => {
      req.user.role = "user";
      req.params = {};
      UserService.prototype.deleteUser.mockResolvedValue(false);
      await userController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: "User not found",
      });
    });

    it("admin cannot delete self", async () => {
      req.user.role = "admin";
      req.params = {};
      await userController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: "Admin cannot delete their own account",
      });
    });

    it("admin delete other user success", async () => {
      req.user.role = "admin";
      req.user.id = 1;
      req.params = { id: 2 };
      UserService.prototype.deleteUser.mockResolvedValue(true);
      await userController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        message: "User deleted successfully",
      });
    });

    it("admin forbidden delete self by id", async () => {
      req.user.role = "admin";
      req.user.id = 1;
      req.params = { id: 1 };
      await userController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: "Admin cannot delete their own account",
      });
    });

    it("admin delete user not found", async () => {
      req.user.role = "admin";
      req.user.id = 1;
      req.params = { id: 2 };
      UserService.prototype.deleteUser.mockResolvedValue(false);
      await userController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: "User not found",
      });
    });

    it("forbidden if not admin and delete other user", async () => {
      req.user.role = "user";
      req.user.id = 1;
      req.params = { id: 2 };
      await userController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: "Forbidden",
      });
    });
  });
});
