const pool = require("../config/database");
const bcrypt = require("bcrypt");

class UserRepository {
  async findByEmail(email) {
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  }

  async create(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool
      .promise()
      .query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
        name,
        email,
        hashedPassword,
      ]);
    return { id: result.insertId, name, email };
  }

  async findById(id) {
    const [rows] = await pool
      .promise()
      .query(
        "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
        [id]
      );
    return rows[0];
  }

  async comparePassword(user, password) {
    return bcrypt.compare(password, user.password);
  }

  async findAll(page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const [rows] = await pool
      .promise()
      .query(
        "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?",
        [pageSize, offset]
      );
    return rows;
  }

  async findAllNoPaging() {
    const [rows] = await pool
      .promise()
      .query(
        "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC"
      );
    return rows;
  }

  async delete(id) {
    const [result] = await pool
      .promise()
      .query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async update(id, name, email, password, role) {
    let query = "UPDATE users SET";
    const params = [];
    const updates = [];

    if (typeof name !== "undefined") {
      updates.push("name = ?");
      params.push(name);
    }
    if (typeof email !== "undefined") {
      updates.push("email = ?");
      params.push(email);
    }
    if (typeof role !== "undefined") {
      updates.push("role = ?");
      params.push(role);
    }
    if (typeof password !== "undefined" && password !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      // Tidak ada field yang diupdate
      return false;
    }

    query += " " + updates.join(", ") + " WHERE id = ?";
    params.push(id);

    const [result] = await pool.promise().query(query, params);
    return result.affectedRows > 0;
  }
}

module.exports = UserRepository;
