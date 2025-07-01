jest.mock("../config/database", () => {
  const query = jest.fn();
  return {
    promise: () => ({
      query,
    }),
    __query: query,
  };
});
const bcrypt = require("bcrypt");
jest.mock("bcrypt");

const UserRepository = require("../repositories/user.repository");
const pool = require("../config/database");

describe("UserRepository", () => {
  let userRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
    pool.promise().query.mockReset();
    bcrypt.hash.mockReset();
    bcrypt.compare.mockReset();
  });

  it("should have findByEmail method", () => {
    expect(typeof userRepository.findByEmail).toBe("function");
  });

  it("findByEmail should return user", async () => {
    pool
      .promise()
      .query.mockResolvedValueOnce([
        [{ id: 1, email: "a@mail.com" }],
        undefined,
      ]);
    const user = await userRepository.findByEmail("a@mail.com");
    expect(pool.promise().query).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = ?",
      ["a@mail.com"]
    );
    expect(user).toEqual({ id: 1, email: "a@mail.com" });
  });

  it("create should insert and return user", async () => {
    bcrypt.hash.mockResolvedValueOnce("hashedpw");
    pool.promise().query.mockResolvedValueOnce([{ insertId: 10 }, undefined]);
    const user = await userRepository.create("A", "a@mail.com", "pw");
    expect(bcrypt.hash).toHaveBeenCalledWith("pw", 10);
    expect(pool.promise().query).toHaveBeenCalledWith(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      ["A", "a@mail.com", "hashedpw"]
    );
    expect(user).toEqual({ id: 10, name: "A", email: "a@mail.com" });
  });

  it("findById should return user", async () => {
    pool
      .promise()
      .query.mockResolvedValueOnce([[{ id: 2, name: "B" }], undefined]);
    const user = await userRepository.findById(2);
    expect(pool.promise().query).toHaveBeenCalledWith(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [2]
    );
    expect(user).toEqual({ id: 2, name: "B" });
  });

  it("comparePassword should call bcrypt.compare", async () => {
    bcrypt.compare.mockResolvedValueOnce(true);
    const user = { password: "hashedpw" };
    const result = await userRepository.comparePassword(user, "pw");
    expect(bcrypt.compare).toHaveBeenCalledWith("pw", "hashedpw");
    expect(result).toBe(true);
  });

  it("findAll should return users", async () => {
    pool
      .promise()
      .query.mockResolvedValueOnce([[{ id: 1 }, { id: 2 }], undefined]);
    const users = await userRepository.findAll(); // default page=1, pageSize=20
    expect(pool.promise().query).toHaveBeenCalledWith(
      "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?",
      [20, 0]
    );
    expect(users).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("delete should return true if affectedRows > 0", async () => {
    pool
      .promise()
      .query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);
    const result = await userRepository.delete(1);
    expect(pool.promise().query).toHaveBeenCalledWith(
      "DELETE FROM users WHERE id = ?",
      [1]
    );
    expect(result).toBe(true);
  });

  it("delete should return false if affectedRows == 0", async () => {
    pool
      .promise()
      .query.mockResolvedValueOnce([{ affectedRows: 0 }, undefined]);
    const result = await userRepository.delete(1);
    expect(result).toBe(false);
  });

  it("update should update name/email/role/password and return true", async () => {
    bcrypt.hash.mockResolvedValueOnce("hashedpw");
    pool
      .promise()
      .query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);
    const result = await userRepository.update(
      1,
      "B",
      "b@mail.com",
      "pw",
      "admin"
    );
    expect(bcrypt.hash).toHaveBeenCalledWith("pw", 10);
    expect(pool.promise().query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE users SET"),
      expect.arrayContaining(["B", "b@mail.com", "admin", "hashedpw", 1])
    );
    expect(result).toBe(true);
  });

  it("update should return false if no fields to update", async () => {
    const result = await userRepository.update(
      1,
      undefined,
      undefined,
      undefined,
      undefined
    );
    expect(result).toBe(false);
  });

  it("update should return false if affectedRows == 0", async () => {
    pool
      .promise()
      .query.mockResolvedValueOnce([{ affectedRows: 0 }, undefined]);
    const result = await userRepository.update(
      1,
      "B",
      undefined,
      undefined,
      undefined
    );
    expect(result).toBe(false);
  });
});
