jest.mock("../config/database", () => ({
  promise: () => ({
    query: jest.fn().mockResolvedValue([[]]),
  }),
}));

const jwt = require("jsonwebtoken");
jest.mock("jsonwebtoken");

const UserService = require("../services/user.service");
const UserRepository = require("../repositories/user.repository");

jest.mock("../repositories/user.repository");

describe("UserService", () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  it("register should call repository", async () => {
    UserRepository.prototype.create.mockResolvedValue({ id: 1 });
    const user = await userService.register("A", "a@mail.com", "pass");
    expect(user).toEqual({ id: 1 });
  });

  it("login fail if user not found", async () => {
    UserRepository.prototype.findByEmail.mockResolvedValue(null);
    await expect(userService.login("a@mail.com", "pass")).rejects.toThrow(
      "User not found"
    );
  });

  it("login fail if password not match", async () => {
    UserRepository.prototype.findByEmail.mockResolvedValue({
      id: 1,
      email: "a@mail.com",
      role: "user",
    });
    UserRepository.prototype.comparePassword.mockResolvedValue(false);
    await expect(userService.login("a@mail.com", "pass")).rejects.toThrow(
      "Invalid credentials"
    );
  });

  it("login success returns token", async () => {
    UserRepository.prototype.findByEmail.mockResolvedValue({
      id: 1,
      email: "a@mail.com",
      role: "user",
    });
    UserRepository.prototype.comparePassword.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token123");
    const token = await userService.login("a@mail.com", "pass");
    expect(token).toBe("token123");
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 1, email: "a@mail.com", role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  });

  it("getAllUsers should call repository", async () => {
    UserRepository.prototype.findAll.mockResolvedValue([{ id: 1 }]);
    const users = await userService.getAllUsers();
    expect(users).toEqual([{ id: 1 }]);
  });

  it("deleteUser should throw if user not found", async () => {
    UserRepository.prototype.findById.mockResolvedValue(null);
    await expect(userService.deleteUser(1)).rejects.toThrow("User not found");
  });

  it("deleteUser should call repository if found", async () => {
    UserRepository.prototype.findById.mockResolvedValue({ id: 1 });
    UserRepository.prototype.delete.mockResolvedValue(true);
    const result = await userService.deleteUser(1);
    expect(result).toBe(true);
  });

  it("updateUser should throw if user not found", async () => {
    UserRepository.prototype.findById.mockResolvedValue(null);
    await expect(
      userService.updateUser(1, "B", "b@mail.com", "pw", "admin")
    ).rejects.toThrow("User not found");
  });

  it("updateUser should call repository if found", async () => {
    UserRepository.prototype.findById.mockResolvedValue({ id: 1 });
    UserRepository.prototype.update.mockResolvedValue(true);
    const result = await userService.updateUser(
      1,
      "B",
      "b@mail.com",
      "pw",
      "admin"
    );
    expect(result).toBe(true);
  });
});
