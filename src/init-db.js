const pool = require("./config/database");
const bcrypt = require("bcrypt");

async function initializeDatabase() {
  try {
    // Buat tabel
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.promise().query(`
  CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    user_id INT,
    image_url VARCHAR(255), -- Tambahkan kolom ini
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )
`);

    console.log("✅ Tables created successfully");

    // Cek apakah sudah ada data
    const [userRows] = await pool
      .promise()
      .query("SELECT * FROM users LIMIT 1");

    if (userRows.length === 0) {
      // Buat data dummy
      const hashedPassword = await bcrypt.hash("password123", 10);

      // Insert users
      const [userResult] = await pool
        .promise()
        .query("INSERT INTO users (name, email, password, role) VALUES ?", [
          [
            ["John Doe", "john@example.com", hashedPassword, "user"],
            ["Jane Smith", "jane@example.com", hashedPassword, "user"],
            ["Admin User", "admin@example.com", hashedPassword, "admin"],
          ],
        ]);

      // Insert products
      await pool
        .promise()
        .query(
          "INSERT INTO products (name, price, description, user_id, image_url) VALUES ?",
          [
            [
              [
                "Laptop",
                1000.0,
                "High performance laptop",
                userResult.insertId,
                null,
              ],
              [
                "Smartphone",
                800.0,
                "Latest smartphone",
                userResult.insertId,
                null,
              ],
              [
                "Tablet",
                500.0,
                "Portable tablet",
                userResult.insertId + 1,
                null,
              ],
              [
                "Headphones",
                150.0,
                "Noise cancelling headphones",
                userResult.insertId + 2,
                null,
              ],
              [
                "Smart Watch",
                300.0,
                "Fitness tracker smart watch",
                userResult.insertId + 2,
                null,
              ],
            ],
          ]
        );

      console.log("✅ Dummy data inserted successfully");
    }
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  } finally {
    // Tutup pool setelah selesai
    pool.end();
  }
}

initializeDatabase();
