const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/user.repository");

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokens = new Set(); // In-memory store for refresh tokens
  }

  async register(name, email, password) {
    return this.userRepository.create(name, email, password);
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");
    const isMatch = await this.userRepository.comparePassword(user, password);
    if (!isMatch) throw new Error("Invalid credentials");

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    this.refreshTokens.add(refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshToken(token) {
    if (!token || !this.refreshTokens.has(token)) {
      throw new Error("Invalid refresh token");
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await this.userRepository.findById(payload.id);
      if (!user) throw new Error("User not found");

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return accessToken;
    } catch (err) {
      throw new Error("Invalid refresh token");
    }
  }

  async logout(token) {
    this.refreshTokens.delete(token);
  }

  async getAllUsers(page = 1, pageSize = 20) {
    return this.userRepository.findAll(page, pageSize);
  }

  async getAllUsersNoPaging() {
    return this.userRepository.findAllNoPaging();
  }

  async deleteUser(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");
    return this.userRepository.delete(userId);
  }

  async updateUser(userId, name, email, password, role) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");
    // Hanya update password jika diberikan (untuk user sendiri)
    return this.userRepository.update(userId, name, email, password, role);
  }
}

module.exports = UserService;
