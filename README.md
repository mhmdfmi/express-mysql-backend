# Express MySQL Backend API

Sebuah backend RESTful API menggunakan Node.js, Express, dan MySQL yang mendukung fitur manajemen user & produk, autentikasi JWT, upload gambar produk, serta validasi API key untuk keamanan.  
API ini cocok digunakan sebagai backend aplikasi e-commerce, katalog produk, atau sistem manajemen inventaris.

## Fitur Utama

- CRUD user & produk (dengan pagination dan endpoint all)
- Autentikasi & otorisasi JWT (user & admin) dengan dukungan **refresh token** dan fitur logout
- Proteksi CSRF menggunakan middleware `csurf` dan manajemen session dengan `express-session`
- Upload gambar produk (dengan Multer, tersimpan di server, URL gambar tersedia di API)
- Validasi API key di semua endpoint (gunakan header `x-api-key` atau query param `api_key`), dengan pengecualian pada environment test
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
   API_KEYS=your_api_key
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=express_mysql_backend
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
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

   npm install
   cd express-mysql-backend

## Dokumentasi API

Buka halaman dokumentasi di:  
`http://localhost:3001/docs`

## Contoh Penggunaan API Key

- **Header:**  
  `x-api-key: your_api_key`
- **Query param:**  
  `/api/v1/products?api_key=your_api_key`

## Contoh Endpoint

- **Register:** `POST /api/v1/users/auth/register`
- **Login:** `POST /api/v1/users/auth/login` (mengembalikan access token dan refresh token)
- **Refresh Token:** `POST /api/v1/users/auth/refresh-token` (untuk mendapatkan access token baru menggunakan refresh token)
- **Logout:** `POST /api/v1/users/auth/logout` (untuk menghapus refresh token)
- **Get Products:** `GET /api/v1/products`
- **Get All Products:** `GET /api/v1/products/all`
- **Create Product (dengan gambar):** `POST /api/v1/products` (form-data, field: image)
- **Akses gambar:** `GET /uploads/<filename>`

## Testing

- **Unit & Performance Test:**
  ```sh
  npm test
  ```
- Pengujian performa sudah disesuaikan dengan timeout yang lebih longgar untuk pengujian paralel yang realistis.
- Pengujian juga sudah mencakup proteksi CSRF dengan pengambilan token CSRF dan penggunaan cookie session.

## Catatan

- Folder `uploads/` di root project digunakan untuk menyimpan file gambar produk.  
  Folder ini di-ignore di git, kecuali `default.jpg` jika diperlukan.
- Jangan upload file `.env` atau data sensitif ke repository publik.
- Setelah menjalankan test, file hasil upload test akan otomatis dibersihkan (kecuali `default.jpg`).
- Middleware validasi API key akan dilewati saat environment adalah `test` untuk memudahkan pengujian otomatis.
- Fitur refresh token dan logout menambah keamanan dan manajemen sesi autentikasi JWT.
- Middleware CSRF dan session management ditambahkan untuk meningkatkan keamanan aplikasi.

---

**Cocok untuk:**  
Belajar backend modern, proyek e-commerce, katalog, atau inventaris, serta integrasi dengan frontend (React, Vue, Angular, dsb).
