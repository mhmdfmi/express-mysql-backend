const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/user.repository");
const logger = require("../utils/logger");

module.exports = async (req, res, next) => {
  // Auto-pass di mode test
  if (process.env.NODE_ENV === "test") {
    req.user = {
      id: 1,
      email: "ucoxadmin@example.com",
      role: "admin",
      name: "Ucox Admin",
    };
    logger.info("Test mode authentication auto-pass for user id 1", {
      category: "login",
    });
    return next();
  }

  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      logger.warn("Authentication required: missing token", {
        ip: req.ip,
        path: req.originalUrl,
        category: "login",
      });
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    const userRepository = new UserRepository();
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      logger.warn("User not found for id: %s", decoded.id, {
        ip: req.ip,
        path: req.originalUrl,
        category: "login",
      });
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    logger.info("User authenticated successfully", {
      userId: user.id,
      email: user.email,
      ip: req.ip,
      path: req.originalUrl,
      category: "login",
    });
    next();
  } catch (error) {
    logger.warn("Invalid token", {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      path: req.originalUrl,
      category: "login",
    });
    res.status(401).json({ error: "Invalid token" });
  }
};
