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
  });

  describe("refreshToken", () => {
    it("should return new access token if refresh token is valid", async () => {
      const refreshToken = "validRefreshToken";
      userService.refreshTokens.add(refreshToken);
      const payload = { id: 1, email: "a@mail.com", role: "user" };
      jwt.verify.mockReturnValue(payload);
      UserRepository.prototype.findById.mockResolvedValue({
        id: 1,
        email: "a@mail.com",
        role: "user",
      });
      jwt.sign.mockReturnValue("newAccessToken");

      const accessToken = await userService.refreshToken(refreshToken);
      expect(accessToken).toBe("newAccessToken");
      expect(jwt.verify).toHaveBeenCalledWith(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
      expect(UserRepository.prototype.findById).toHaveBeenCalledWith(1);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: "a@mail.com", role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
    });

    it("should throw error if token is not provided or not in refreshTokens", async () => {
      await expect(userService.refreshToken(null)).rejects.toThrow(
        "Invalid refresh token"
      );
      await expect(userService.refreshToken("invalidToken")).rejects.toThrow(
        "Invalid refresh token"
      );
    });

    it("should throw error if jwt.verify fails", async () => {
      const refreshToken = "badToken";
      userService.refreshTokens.add(refreshToken);
      jwt.verify.mockImplementation(() => {
        throw new Error("jwt error");
      });
      await expect(userService.refreshToken(refreshToken)).rejects.toThrow(
        "Invalid refresh token"
      );
    });
  });

  describe("logout", () => {
    it("should remove token from refreshTokens set", async () => {
      const token = "tokenToRemove";
      userService.refreshTokens.add(token);
      await userService.logout(token);
      expect(userService.refreshTokens.has(token)).toBe(false);
    });
  });

  describe("getAllUsersNoPaging", () => {
    it("should call repository and return users", async () => {
      UserRepository.prototype.findAllNoPaging.mockResolvedValue([{ id: 1 }]);
      const users = await userService.getAllUsersNoPaging();
      expect(users).toEqual([{ id: 1 }]);
    });
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
    const tokens = await userService.login("a@mail.com", "pass");
    expect(tokens).toEqual({
      accessToken: "token123",
      refreshToken: "token123",
    });
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

describe("UserService additional methods", () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe("refreshToken", () => {
    it("should return new access token if refresh token is valid", async () => {
      const refreshToken = "validRefreshToken";
      userService.refreshTokens.add(refreshToken);
      const payload = { id: 1, email: "a@mail.com", role: "user" };
      jwt.verify.mockReturnValue(payload);
      UserRepository.prototype.findById.mockResolvedValue({
        id: 1,
        email: "a@mail.com",
        role: "user",
      });
      jwt.sign.mockReturnValue("newAccessToken");

      const accessToken = await userService.refreshToken(refreshToken);
      expect(accessToken).toBe("newAccessToken");
      expect(jwt.verify).toHaveBeenCalledWith(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
      expect(UserRepository.prototype.findById).toHaveBeenCalledWith(1);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: "a@mail.com", role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
    });

    it("should throw error if token is not provided or not in refreshTokens", async () => {
      await expect(userService.refreshToken(null)).rejects.toThrow(
        "Invalid refresh token"
      );
      await expect(userService.refreshToken("invalidToken")).rejects.toThrow(
        "Invalid refresh token"
      );
    });

    it("should throw error if jwt.verify fails", async () => {
      const refreshToken = "badToken";
      userService.refreshTokens.add(refreshToken);
      jwt.verify.mockImplementation(() => {
        throw new Error("jwt error");
      });
      await expect(userService.refreshToken(refreshToken)).rejects.toThrow(
        "Invalid refresh token"
      );
    });
  });

  describe("logout", () => {
    it("should remove token from refreshTokens set", async () => {
      const token = "tokenToRemove";
      userService.refreshTokens.add(token);
      await userService.logout(token);
      expect(userService.refreshTokens.has(token)).toBe(false);
    });
  });

  describe("getAllUsersNoPaging", () => {
    it("should call repository and return users", async () => {
      UserRepository.prototype.findAllNoPaging.mockResolvedValue([{ id: 1 }]);
      const users = await userService.getAllUsersNoPaging();
      expect(users).toEqual([{ id: 1 }]);
    });
  });
});
