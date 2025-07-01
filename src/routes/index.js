// filepath: [index.js](http://_vscodecontentref_/0)
const express = require("express");
const apikeyMiddleware = require("../middlewares/apikey.middleware");

const router = express.Router();

// Terapkan API key ke semua endpoint API
router.use(apikeyMiddleware);

router.use("/users", require("./user.routes"));
router.use("/products", require("./product.routes"));

module.exports = router;
