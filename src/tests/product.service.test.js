jest.mock("../config/database", () => ({
  promise: () => ({
    query: jest.fn().mockResolvedValue([[]]),
  }),
}));

const ProductService = require("../services/product.service");
const ProductRepository = require("../repositories/product.repository");

jest.mock("../repositories/product.repository");

describe("ProductService", () => {
  let productService;

  beforeEach(() => {
    productService = new ProductService();
  });

  it("getAll should call repository", async () => {
    ProductRepository.prototype.findAll.mockResolvedValue([{ id: 1 }]);
    const products = await productService.getAll();
    expect(products).toEqual([{ id: 1 }]);
  });

  it("getAllNoPaging should call repository", async () => {
    ProductRepository.prototype.findAllNoPaging.mockResolvedValue([{ id: 1 }]);
    const products = await productService.getAllNoPaging();
    expect(products).toEqual([{ id: 1 }]);
  });

  it("getById should return product", async () => {
    ProductRepository.prototype.findById.mockResolvedValue({
      id: 2,
      name: "A",
    });
    const product = await productService.getById(2);
    expect(product).toEqual({ id: 2, name: "A" });
  });

  it("getById not found", async () => {
    ProductRepository.prototype.findById.mockResolvedValue(null);
    const product = await productService.getById(99);
    expect(product).toBeNull();
  });

  it("create should call repository and return product with image_url", async () => {
    const newProduct = {
      id: 3,
      name: "B",
      price: "100",
      description: "desc",
      userId: 1,
      image_url: "/uploads/img.jpg",
    };
    ProductRepository.prototype.create.mockResolvedValue(newProduct);
    const result = await productService.create(
      "B",
      "100",
      "desc",
      1,
      "/uploads/img.jpg"
    );
    expect(result).toEqual(newProduct);
  });

  it("update should return true if updated", async () => {
    ProductRepository.prototype.update.mockResolvedValue(true);
    const result = await productService.update(
      1,
      "C",
      "200",
      "desc2",
      "/uploads/img2.jpg"
    );
    expect(result).toBe(true);
  });

  it("update should return false if not found", async () => {
    ProductRepository.prototype.update.mockResolvedValue(false);
    const result = await productService.update(
      99,
      "C",
      "200",
      "desc2",
      "/uploads/img2.jpg"
    );
    expect(result).toBe(false);
  });

  it("delete should return true if deleted", async () => {
    ProductRepository.prototype.delete.mockResolvedValue(true);
    const result = await productService.delete(1);
    expect(result).toBe(true);
  });

  it("delete should return false if not found", async () => {
    ProductRepository.prototype.delete.mockResolvedValue(false);
    const result = await productService.delete(99);
    expect(result).toBe(false);
  });
});
