const UserService = require("../services/user.service");
const { success, error } = require("../utils/helper.response");
const cache = require("../utils/cache");

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async register(req, res) {
    try {
      const user = await this.userService.register(
        req.body.name,
        req.body.email,
        req.body.password
      );
      cache.flushAll(); // flush cache setelah register
      return success(res, user, "User registered successfully", 201);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async login(req, res) {
    try {
      const token = await this.userService.login(
        req.body.email,
        req.body.password
      );
      return success(res, { token }, "Login successful");
    } catch (err) {
      return error(res, err.message, 401);
    }
  }

  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const cacheKey = `users:all:page:${page}:size:${pageSize}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return success(res, cached, "success (from cache)");
      }
      const users = await this.userService.getAllUsers(page, pageSize);
      cache.set(cacheKey, users);
      return success(res, users);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  async getAllUsersNoPaging(req, res) {
    try {
      const users = await this.userService.getAllUsersNoPaging();
      return success(res, users);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  async updateUser(req, res) {
    try {
      const isSelf = !req.params.id;
      const userId = req.params.id || req.user.id;
      const isAdmin = req.user.role === "admin";

      if (isSelf) {
        if (typeof req.body.role !== "undefined") {
          return error(res, "You are not allowed to update your own role", 403);
        }
        const updated = await this.userService.updateUser(
          userId,
          req.body.name,
          req.body.email,
          req.body.password,
          undefined
        );
        if (!updated) return error(res, "User not found", 404);
        cache.flushAll(); // flush cache setelah update
        return success(res, null, "User updated successfully");
      } else if (isAdmin) {
        if (
          typeof req.body.role === "undefined" ||
          typeof req.body.name !== "undefined" ||
          typeof req.body.email !== "undefined" ||
          typeof req.body.password !== "undefined"
        ) {
          return error(res, "Admin can only update role of other users", 403);
        }
        const updated = await this.userService.updateUser(
          userId,
          undefined,
          undefined,
          undefined,
          req.body.role
        );
        if (!updated) return error(res, "User not found", 404);
        cache.flushAll(); // flush cache setelah update
        return success(res, null, "User's role updated successfully");
      } else {
        return error(res, "Forbidden", 403);
      }
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async deleteUser(req, res) {
    try {
      const isSelf = !req.params.id;
      const userId = req.params.id || req.user.id;
      const isAdmin = req.user.role === "admin";

      if (isSelf) {
        if (isAdmin) {
          return error(res, "Admin cannot delete their own account", 403);
        }
        const deleted = await this.userService.deleteUser(userId);
        if (!deleted) {
          return error(res, "User not found", 404);
        }
        cache.flushAll(); // flush cache setelah delete
        return success(res, null, "User deleted successfully");
      } else {
        if (!isAdmin) {
          return error(res, "Forbidden", 403);
        }
        if (parseInt(req.params.id) === req.user.id) {
          return error(res, "Admin cannot delete their own account", 403);
        }
        const deleted = await this.userService.deleteUser(userId);
        if (!deleted) {
          return error(res, "User not found", 404);
        }
        cache.flushAll(); // flush cache setelah delete
        return success(res, null, "User deleted successfully");
      }
    } catch (err) {
      return error(res, err.message, 500);
    }
  }
}

module.exports = UserController;
