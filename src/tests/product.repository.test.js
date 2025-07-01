jest.mock("../config/database", () => {
  const query = jest.fn();
  return {
    promise: () => ({
      query,
    }),
    __query: query,
  };
});
const ProductRepository = require("../repositories/product.repository");
const pool = require("../config/database");

describe("ProductRepository", () => {
  let productRepository;

  beforeEach(() => {
    productRepository = new ProductRepository();
    pool.promise().query.mockReset();
  });

  it("should have findAll method", () => {
    expect(typeof productRepository.findAll).toBe("function");
  });

  it("create should insert and return product with image_url", async () => {
    pool.promise().query.mockResolvedValueOnce([{ insertId: 10 }, undefined]);
    const result = await productRepository.create(
      "A",
      "100",
      "desc",
      1,
      "/uploads/img.jpg"
    );
    expect(pool.promise().query).toHaveBeenCalledWith(
      "INSERT INTO products (name, price, description, user_id, image_url) VALUES (?, ?, ?, ?, ?)",
      ["A", "100", "desc", 1, "/uploads/img.jpg"]
    );
    expect(result).toEqual({
      id: 10,
      name: "A",
      price: "100",
      description: "desc",
      userId: 1,
      image_url: "/uploads/img.jpg",
    });
  });

  it("findAll should return rows", async () => {
    pool
      .promise()
      .query.mockResolvedValueOnce([[{ id: 1 }, { id: 2 }], undefined]);
    const result = await productRepository.findAll(1, 10);
    expect(pool.promise().query).toHaveBeenCalledWith(
      "SELECT * FROM products LIMIT ? OFFSET ?",
      [10, 0]
    );
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("findAllNoPaging should return all rows", async () => {
    pool
      .promise()
      .query.mockResolvedValueOnce([[{ id: 1 }, { id: 2 }], undefined]);
    const result = await productRepository.findAllNoPaging();
    expect(pool.promise().query).toHaveBeenCalledWith(
      "SELECT * FROM products ORDER BY id DESC"
    );
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("findById should return single row", async () => {
    pool
      .promise()
      .query.mockResolvedValueOnce([[{ id: 1, name: "A" }], undefined]);
    const result = await productRepository.findById(1);
    expect(pool.promise().query).toHaveBeenCalledWith(
      "SELECT * FROM products WHERE id = ?",
      [1]
    );
    expect(result).toEqual({ id: 1, name: "A" });
  });

  it("update should return true if affectedRows > 0", async () => {
    pool
      .promise()
      .query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);
    const result = await productRepository.update(
      1,
      "B",
      "200",
      "desc2",
      "/uploads/img2.jpg"
    );
    expect(pool.promise().query).toHaveBeenCalledWith(
      "UPDATE products SET name = ?, price = ?, description = ?, image_url = ? WHERE id = ?",
      ["B", "200", "desc2", "/uploads/img2.jpg", 1]
    );
    expect(result).toBe(true);
  });

  it("update should return false if affectedRows == 0", async () => {
    pool
      .promise()
      .query.mockResolvedValueOnce([{ affectedRows: 0 }, undefined]);
    const result = await productRepository.update(
      1,
      "B",
      "200",
      "desc2",
      "/uploads/img2.jpg"
    );
    expect(result).toBe(false);
  });

  it("delete should return true if affectedRows > 0", async () => {
    pool
      .promise()
      .query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);
    const result = await productRepository.delete(1);
    expect(pool.promise().query).toHaveBeenCalledWith(
      "DELETE FROM products WHERE id = ?",
      [1]
    );
    expect(result).toBe(true);
  });

  it("delete should return false if affectedRows == 0", async () => {
    pool
      .promise()
      .query.mockResolvedValueOnce([{ affectedRows: 0 }, undefined]);
    const result = await productRepository.delete(1);
    expect(result).toBe(false);
  });
});
