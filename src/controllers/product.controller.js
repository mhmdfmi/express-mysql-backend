const ProductService = require("../services/product.service");
const { success, error } = require("../utils/helper.response");
const cache = require("../utils/cache");

class ProductController {
  constructor(productService) {
    this.productService = productService || new ProductService();
  }

  async getAllNoPaging(req, res) {
    try {
      const cacheKey = "products:all:noPaging";
      const cached = cache.get(cacheKey);
      if (cached) {
        return success(res, cached, "success (from cache)");
      }
      const products = await this.productService.getAllNoPaging();
      cache.set(cacheKey, products);
      return success(res, products);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Update getAll agar support pagination dari query param
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const cacheKey = `products:all:page:${page}:size:${pageSize}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return success(res, cached, "success (from cache)");
      }

      const products = await this.productService.getAll(page, pageSize);
      cache.set(cacheKey, products);
      return success(res, products);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }
  async getById(req, res) {
    try {
      const cacheKey = `products:${req.params.id}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return success(res, cached, "success (from cache)");
      }

      const product = await this.productService.getById(req.params.id);
      if (!product) return error(res, "Product not found", 404);

      cache.set(cacheKey, product);
      return success(res, product);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  async create(req, res) {
    try {
      const { name, price, description } = req.body;
      const userId = req.user?.id;
      // Ambil url file jika ada
      let imageUrl = null;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      const product = await this.productService.create(
        name,
        price,
        description,
        userId,
        imageUrl
      );
      cache.flushAll();
      return success(res, product, "Product created successfully", 201);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async update(req, res) {
    try {
      const { name, price, description } = req.body;
      let imageUrl = undefined;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      const updated = await this.productService.update(
        req.params.id,
        name,
        price,
        description,
        imageUrl
      );
      if (!updated) {
        return error(res, "Product not found", 404);
      }
      cache.flushAll();
      return success(res, null, "Product updated successfully");
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const deleted = await this.productService.delete(req.params.id);
      if (!deleted) {
        return error(res, "Product not found", 404);
      }
      cache.flushAll(); // flush cache setelah delete
      return success(res, null, "Product deleted successfully");
    } catch (err) {
      return error(res, err.message, 400);
    }
  }
}

module.exports = ProductController;
