const express = require("express");
// Import controller untuk menangani logic produk
const ProductController = require("../controllers/product.controller");
// Import middleware autentikasi untuk proteksi endpoint tertentu
const authMiddleware = require("../middlewares/auth.middleware");
// Inisialisasi instance controller produk
const productController = new ProductController();

const multer = require("multer");
const path = require("path");

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

// Endpoint POST /api/v1/products dengan upload image
router.post(
  "/",
  authMiddleware,
  upload.single("image"), // field name: image
  productController.create.bind(productController)
);

// Endpoint PUT /api/v1/products/:id dengan upload image (opsional)
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
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
