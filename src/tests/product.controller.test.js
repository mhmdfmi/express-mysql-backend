jest.mock("../config/database", () => ({
  promise: () => ({
    query: jest.fn().mockResolvedValue([[]]),
  }),
}));

const ProductController = require("../controllers/product.controller");
const ProductService = require("../services/product.service");

jest.mock("../services/product.service");

describe("ProductController", () => {
  let productController, req, res, mockService;

  beforeEach(() => {
    mockService = new ProductService();
    productController = new ProductController(mockService);
    req = { body: {}, params: {}, user: { id: 1 }, file: undefined };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it("getAll returns products", async () => {
    req.query = { page: 1, pageSize: 10 };
    mockService.getAll.mockResolvedValue([{ id: 1, name: "P" }]);
    await productController.getAll(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 200,
      message: "success",
      data: [{ id: 1, name: "P" }],
    });
  });

  it("getAllNoPaging returns all products", async () => {
    mockService.getAllNoPaging.mockResolvedValue([{ id: 1, name: "P" }]);
    await productController.getAllNoPaging(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 200,
      message: "success",
      data: [{ id: 1, name: "P" }],
    });
  });

  it("getById not found", async () => {
    mockService.getById.mockResolvedValue(null);
    req.params.id = 99;
    await productController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: "Product not found",
    });
  });

  it("create should return 201 and created product with image_url", async () => {
    const newProduct = {
      id: 2,
      name: "New",
      price: "100",
      description: "desc",
      image_url: "/uploads/img.jpg",
    };
    req.body = { name: "New", price: "100", description: "desc" };
    req.file = { filename: "img.jpg" };
    mockService.create.mockResolvedValue(newProduct);

    await productController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 201,
      message: "Product created successfully",
      data: newProduct,
    });
  });

  it("update should return 200 if updated", async () => {
    req.body = { name: "U", price: "200", description: "desc2" };
    req.params.id = 1;
    req.file = { filename: "img2.jpg" };
    mockService.update.mockResolvedValue(true);

    await productController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 200,
      message: "Product updated successfully",
    });
  });

  it("update should return 404 if not found", async () => {
    req.body = { name: "U", price: "200", description: "desc2" };
    req.params.id = 999;
    mockService.update.mockResolvedValue(false);

    await productController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: "Product not found",
    });
  });

  it("delete should return 200 if deleted", async () => {
    req.params.id = 1;
    mockService.delete.mockResolvedValue(true);

    await productController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 200,
      message: "Product deleted successfully",
    });
  });

  it("delete should return 404 if not found", async () => {
    req.params.id = 999;
    mockService.delete.mockResolvedValue(false);

    await productController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: "Product not found",
    });
  });
});
