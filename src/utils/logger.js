const { createLogger, format, transports } = require("winston");
const path = require("path");
const fs = require("fs");

// Pastikan folder logs ada, jika tidak buat foldernya
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logDir, "error.txt"),
      level: "error",
    }),
    new transports.File({
      filename: path.join(logDir, "combined.txt"),
    }),
    new transports.File({
      filename: path.join(logDir, "login.txt"),
      level: "info",
    }),
  ],
});

module.exports = logger;
