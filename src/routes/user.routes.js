const express = require("express");
const UserController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");

const router = express.Router();
const userController = new UserController();

// Untuk user mendaftar
router.post("/auth/register", userController.register.bind(userController));

// Untuk user login
router.post("/auth/login", userController.login.bind(userController));

// Untuk mendapatkan semua users dengan paginasi
router.get("/", userController.getAllUsers.bind(userController));

// Untuk mendapatkan semua users tanpa paginasi
router.get("/all", userController.getAllUsersNoPaging.bind(userController));

// Untuk user mengupdate diri sendiri
router.put(
  "/me",
  authMiddleware,
  userController.updateUser.bind(userController)
);

// Untuk admin mengupdate user lain
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  userController.updateUser.bind(userController)
);

// Untuk user menghapus diri sendiri
router.delete(
  "/me",
  authMiddleware,
  userController.deleteUser.bind(userController)
);

// Untuk admin menghapus user lain
router.delete(
  "/:id",
  authMiddleware,
  isAdmin,
  userController.deleteUser.bind(userController)
);

module.exports = router;
