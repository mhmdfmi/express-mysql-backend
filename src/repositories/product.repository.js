const pool = require("../config/database");

class ProductRepository {
  // Buat produk baru
  async create(name, price, description, userId, imageUrl) {
    const [result] = await pool
      .promise()
      .query(
        "INSERT INTO products (name, price, description, user_id, image_url) VALUES (?, ?, ?, ?, ?)",
        [name, price, description, userId, imageUrl]
      );
    return {
      id: result.insertId,
      name,
      price,
      description,
      userId,
      image_url: imageUrl,
    };
  }

  // Update produk
  async update(id, name, price, description, imageUrl) {
    let query = "UPDATE products SET name = ?, price = ?, description = ?";
    let params = [name, price, description];
    if (imageUrl !== undefined) {
      query += ", image_url = ?";
      params.push(imageUrl);
    }
    query += " WHERE id = ?";
    params.push(id);
    const [result] = await pool.promise().query(query, params);
    return result.affectedRows > 0;
  }

  // Update produk
  async update(id, name, price, description, imageUrl) {
    let query = "UPDATE products SET name = ?, price = ?, description = ?";
    let params = [name, price, description];
    if (imageUrl !== undefined) {
      query += ", image_url = ?";
      params.push(imageUrl);
    }
    query += " WHERE id = ?";
    params.push(id);
    const [result] = await pool.promise().query(query, params);
    return result.affectedRows > 0;
  }

  // Dapatkan semua produk dengan paginasi
  async findAll(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM products LIMIT ? OFFSET ?", [pageSize, offset]);
    return rows;
  }

  async findAllNoPaging() {
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM products ORDER BY id DESC");
    return rows;
  }

  // Dapatkan produk berdasarkan ID
  async findById(id) {
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM products WHERE id = ?", [id]);
    return rows[0];
  }

  async delete(id) {
    const [result] = await pool
      .promise()
      .query("DELETE FROM products WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ProductRepository;
