const express = require("express");
const { body, validationResult } = require("express-validator");
const UserController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");

const router = express.Router();
const userController = new UserController();

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(400).json({ errors: errors.array() });
  };
};

// Untuk user mendaftar
router.post(
  "/auth/register",
  validate([
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ]),
  userController.register.bind(userController)
);

// Untuk user login
router.post(
  "/auth/login",
  validate([
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ]),
  async (req, res, next) => {
    try {
      const { accessToken, refreshToken } =
        await userController.userService.login(
          req.body.email,
          req.body.password
        );
      res.json({ accessToken, refreshToken });
    } catch (err) {
      next(err);
    }
  }
);

// Endpoint refresh token
router.post("/auth/refresh-token", async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }
  try {
    const accessToken = await userController.userService.refreshToken(
      refreshToken
    );
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Endpoint logout
router.post("/auth/logout", async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }
  try {
    await userController.userService.logout(refreshToken);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
});

// Untuk mendapatkan semua users dengan paginasi
router.get("/", userController.getAllUsers.bind(userController));

// Untuk mendapatkan semua users tanpa paginasi
router.get("/all", userController.getAllUsersNoPaging.bind(userController));

// Untuk user mengupdate diri sendiri
router.put(
  "/me",
  authMiddleware,
  validate([
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role").not().exists().withMessage("Cannot update role"),
  ]),
  userController.updateUser.bind(userController)
);

// Untuk admin mengupdate user lain
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  validate([
    body("role")
      .exists()
      .withMessage("Role is required")
      .isIn(["user", "admin"])
      .withMessage("Role must be user or admin"),
    body("name").not().exists().withMessage("Cannot update name"),
    body("email").not().exists().withMessage("Cannot update email"),
    body("password").not().exists().withMessage("Cannot update password"),
  ]),
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
