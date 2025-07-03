const express = require("express");
const { body, validationResult } = require("express-validator");
// Import controller untuk menangani logic produk
const ProductController = require("../controllers/product.controller");
// Import middleware autentikasi untuk proteksi endpoint tertentu
const authMiddleware = require("../middlewares/auth.middleware");
// Inisialisasi instance controller produk
const productController = new ProductController();

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder penyimpanan
  },
  filename: function (req, file, cb) {
    // Simpan nama unik: timestamp-namaasli
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

const router = express.Router();

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(400).json({ errors: errors.array() });
  };
};

// Endpoint POST /api/v1/products dengan upload image
router.post(
  "/",
  authMiddleware,
  upload.single("image"), // field name: image
  validate([
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ gt: 0 })
      .withMessage("Price must be a positive number"),
    body("description").optional().trim(),
  ]),
  productController.create.bind(productController)
);

// Endpoint PUT /api/v1/products/:id dengan upload image (opsional)
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  validate([
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),
    body("price")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Price must be a positive number"),
    body("description").optional().trim(),
  ]),
  productController.update.bind(productController)
);

// Endpoint GET /api/v1/products/all
// Mengambil semua produk tanpa pagination (gunakan hanya untuk data kecil)
router.get("/all", productController.getAllNoPaging.bind(productController));

// Endpoint GET /api/v1/products
// Mengambil daftar produk dengan pagination (page & pageSize dari query param)
router.get("/", productController.getAll.bind(productController));

// Endpoint GET /api/v1/products/:id
// Mengambil detail produk berdasarkan ID
router.get("/:id", productController.getById.bind(productController));

// Endpoint POST /api/v1/products
// Membuat produk baru, hanya bisa diakses user yang sudah login (authMiddleware)
router.post(
  "/",
  authMiddleware,
  productController.create.bind(productController)
);

// Endpoint PUT /api/v1/products/:id
// Mengupdate data produk berdasarkan ID, hanya untuk user login
router.put(
  "/:id",
  authMiddleware,
  productController.update.bind(productController)
);

// Endpoint DELETE /api/v1/products/:id
// Menghapus produk berdasarkan ID, hanya untuk user login
router.delete(
  "/:id",
  authMiddleware,
  productController.delete.bind(productController)
);

module.exports = router;
