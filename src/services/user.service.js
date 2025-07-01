const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/user.repository");

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(name, email, password) {
    return this.userRepository.create(name, email, password);
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");
    const isMatch = await this.userRepository.comparePassword(user, password);
    if (!isMatch) throw new Error("Invalid credentials");
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
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
