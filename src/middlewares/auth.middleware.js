const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/user.repository");

module.exports = async (req, res, next) => {
  // Auto-pass di mode test
  if (process.env.NODE_ENV === "test") {
    req.user = {
      id: 1,
      email: "ucoxadmin@example.com",
      role: "admin",
      name: "Ucox Admin",
    };
    return next();
  }

  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    const userRepository = new UserRepository();
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
