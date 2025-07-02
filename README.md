# Express MySQL Backend API

Sebuah backend RESTful API menggunakan Node.js, Express, dan MySQL yang mendukung fitur manajemen user & produk, autentikasi JWT, upload gambar produk, serta validasi API key untuk keamanan.  
API ini cocok digunakan sebagai backend aplikasi e-commerce, katalog produk, atau sistem manajemen inventaris.

## Fitur Utama

- CRUD user & produk (dengan pagination dan endpoint all)
- Autentikasi & otorisasi JWT (user & admin)
- Upload gambar produk (dengan Multer, tersimpan di server, URL gambar tersedia di API)
- Validasi API key di semua endpoint (gunakan header `api-key` atau query param `api_key`)
- Endpoint akses gambar statis (`/uploads/<filename>`)
- Middleware keamanan (CORS, Helmet, Rate Limiting)
- Struktur kode modular (MVC: controller, service, repository)
- Unit & performance test siap pakai

## Instalasi

1. **Clone repository:**

   ```sh
   git clone https://github.com/mhmdfmi/express-mysql-backend.git
   cd express-mysql-backend
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Buat file `.env` dan sesuaikan konfigurasi:**

   ```
   HOST=http://localhost
   PORT=3001
   ORIGIN=http://localhost:3001
   API_KEYS=2f8e6c7b-1a3d-4e9f-8b2c-7d1e5a6f9b3c,7e4d2a1b-9c8f-4b6e-8d2a-3f7c5e1a9b4d
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=express_mysql_backend
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1h
   NODE_ENV=development
   ```

4. **Jalankan migrasi/init database (jika ada):**

   ```sh
   npm run init-db
   ```

5. **Jalankan server:**
   ```sh
   npm start
   ```
   atau untuk development:
   ```sh
   npm run dev
   ```

## Dokumentasi API

Buka halaman dokumentasi di:  
`http://localhost:3001/docs`

## Contoh Penggunaan API Key

- **Header:**  
  `api-key: 2f8e6c7b-1a3d-4e9f-8b2c-7d1e5a6f9b3c`
- **Query param:**  
  `/api/v1/products?api_key=2f8e6c7b-1a3d-4e9f-8b2c-7d1e5a6f9b3c`

## Contoh Endpoint

- **Register:** `POST /api/v1/users/auth/register`
- **Login:** `POST /api/v1/users/auth/login`
- **Get Products:** `GET /api/v1/products`
- **Get All Products:** `GET /api/v1/products/all`
- **Create Product (dengan gambar):** `POST /api/v1/products` (form-data, field: image)
- **Akses gambar:** `GET /uploads/<filename>`

## Testing

- **Unit & Performance Test:**
  ```sh
  npm test
  ```

## Catatan

- Folder `uploads/` di root project digunakan untuk menyimpan file gambar produk.  
  Folder ini di-ignore di git, kecuali `default.jpg` jika diperlukan.
- Jangan upload file `.env` atau data sensitif ke repository publik.
- Setelah menjalankan test, file hasil upload test akan otomatis dibersihkan (kecuali `default.jpg`).

---

**Cocok untuk:**  
Belajar backend modern, proyek e-commerce, katalog, atau inventaris, serta integrasi dengan frontend (React, Vue, Angular, dsb).
