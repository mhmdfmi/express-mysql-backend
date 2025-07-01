require("dotenv").config();
const mysql = require("mysql2"); // Ganti dengan mysql2

const db_name = process.env.DB_NAME || "your_db_name";
const db_user = process.env.DB_USER || "your_db_user";
const db_password = process.env.DB_PASSWORD || "your_db_pass";
const db_host = process.env.DB_HOST || "your_db_host";
const db_port = process.env.DB_PORT || 3306; // Default port untuk MySQL

if (!db_name || !db_user || !db_password || !db_host) {
  console.error(
    "❌ Missing required environment variables for database connection."
  );
  process.exit(1);
}

// Buat koneksi pool
const pool = mysql.createPool({
  host: db_host,
  port: db_port,
  user: db_user,
  password: db_password,
  database: db_name,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
});

// Tes koneksi database
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Unable to connect to database:", err);
    return;
  }

  // console.log("✅ Database connected successfully.");
  connection.release();
});

// Export pool untuk digunakan di repository
module.exports = pool;
module.exports.closePool = () => pool.end();
