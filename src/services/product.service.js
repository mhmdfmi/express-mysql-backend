const ProductRepository = require("../repositories/product.repository");

class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAll(page = 1, pageSize = 10) {
    return this.productRepository.findAll(page, pageSize);
  }

  async getAllNoPaging() {
    return this.productRepository.findAllNoPaging();
  }

  async getById(id) {
    return this.productRepository.findById(id);
  }

  async create(name, price, description, userId, imageUrl) {
    return this.productRepository.create(
      name,
      price,
      description,
      userId,
      imageUrl
    );
  }

  async update(id, name, price, description, imageUrl) {
    return this.productRepository.update(
      id,
      name,
      price,
      description,
      imageUrl
    );
  }

  async delete(id) {
    return this.productRepository.delete(id);
  }
}

module.exports = ProductService;
