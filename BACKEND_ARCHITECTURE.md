# Arsitektur Backend & Panduan Deployment (Laravel MUA Platform)

Dokumen ini berisi rancangan arsitektur backend, skema database, API endpoint, dan panduan deployment ke Laravel Cloud untuk platform Make Up Artist (MUA) Multi-Tenant.

## 1. Tech Stack
- **Framework:** Laravel 11
- **Database:** MySQL
- **Authentication:** Laravel Sanctum (Token-Based / API Tokens)
- **Deployment:** Laravel Cloud
- **Frontend Integration:** Next.js (NextAuth)

---

## 2. Skema Database (MySQL)

Skema dirancang untuk mendukung *multiple accounts* (Multi-Tenant). Data autentikasi dipisahkan dari data profil publik MUA.

### `users`
Tabel standar autentikasi Laravel. (Role dan Permission akan menggunakan package `spatie/laravel-permission` dengan tabel terpisah bawaan package seperti `roles`, `permissions`, `model_has_roles`).
Role yang tersedia nantinya: **Super Admin**, **MUA**, dan **Staff MUA**.
- `id` (Primary Key, UUID/ULID atau BigInt)
- `mua_id` (Foreign Key -> `users.id`, Nullable) -> Jika role-nya `Staff MUA`, kolom ini berisi ID akun MUA yang merekrutnya.
- `name` (String)
- `email` (String, Unique)
- `password` (String, Nullable) -> Kosong jika register/login menggunakan Google
- `google_id` (String, Unique, Nullable) -> ID dari akun Google OAuth
- `email_verified_at` (Timestamp, Nullable)
- `remember_token` (String, Nullable)
- `timestamps` (created_at, updated_at)

### `subscriptions`
Tabel untuk mengelola status berlangganan (Free/Pro) dari MUA. Terpisah dari tabel `users` untuk mempermudah tracking histori tagihan/langganan.
- `id` (Primary Key)
- `user_id` (Foreign Key -> `users.id`) -> Akun MUA pemilik langganan
- `plan_name` (String) -> contoh: 'FREE', 'PRO'
- `status` (Enum/String) -> contoh: 'ACTIVE', 'EXPIRED', 'CANCELED'
- `starts_at` (Timestamp)
- `expires_at` (Timestamp, Nullable)
- `payment_reference` (String, Nullable) -> Reference pembayaran jika integrasi payment gateway
- `timestamps`

### `mua_profiles`
Tabel untuk menyimpan informasi publik MUA yang akan ditampilkan di halaman homepage masing-masing (berdasarkan struktur UI Aldena's Makeup).
- `id` (Primary Key)
- `user_id` (Foreign Key -> `users.id`, Unique)
- `slug` (String, Unique) -> Digunakan untuk URL (contoh: `domain.com/aldenas`)
- `brand_name` (String) -> Nama panggung/bisnis MUA (contoh: "Aldena's Makeup")
- `tagline` (String, Nullable) -> Teks kecil di atas judul (contoh: "Professional Makeup Artist")
- `hero_title` (String, Nullable) -> Judul besar di Hero Section (contoh: "Enhance Your Natural Beauty")
- `hero_description` (Text, Nullable) -> Deskripsi di Hero Section
- `supported_brands` (JSON, Nullable) -> Array berisi URL gambar produk/brand kosmetik pilihan MUA
- `service_area` (JSON Array, Nullable) -> Array area layanan MUA (contoh: `["Jakarta", "Depok", "Bekasi"]`)
- `profile_image_url` (String, Nullable)
- `cover_image_url` (String, Nullable)
- `instagram_username` (String, Nullable)
- `whatsapp_number` (String, Nullable)
- `address` (Text, Nullable)
- `timestamps`

### `portfolios`
- `id` (Primary Key, UUID)
- `user_id` (Foreign Key -> `users.id`) -> Pemilik portfolio
- `title` (String)
- `category` (String) -> enum/string: 'wedding', 'wisuda', 'photoshoot', dll.
- `image_url` (String)
- `alt_text` (String)
- `timestamps`

### `services`
- `id` (Primary Key, UUID)
- `user_id` (Foreign Key -> `users.id`) -> Pemilik layanan
- `name` (String)
- `description` (Text, Nullable)
- `price` (Integer)
- `icon_name` (String, default: "Sparkles")
- `deleted_at` (Timestamp, Nullable) -> Soft Delete
- `timestamps`

### `bookings`
- `id` (Primary Key, UUID)
- `user_id` (Foreign Key -> `users.id`) -> MUA yang menerima pesanan
- `service_id` (Foreign Key -> `services.id`) -> Layanan yang dipesan
- `client_name` (String)
- `whatsapp` (String)
- `instagram` (String, Nullable)
- `total_person` (Integer)
- `event_name` (String)
- `event_date` (Date)
- `event_time` (Time)
- `location` (Text)
- `notes` (Text, Nullable)
- `payment_deadline` (DateTime)
- `custom_code` (String, Unique) -> Kode unik untuk tracking
- `status` (Enum/String: PENDING, DP_PAID, COMPLETED, CANCELED)
- `total_price` (Integer)
- `dp_amount` (Integer)
- `timestamps`

### `notifications`
- `id` (Primary Key, UUID)
- `user_id` (Foreign Key -> `users.id`) -> Penerima notifikasi
- `booking_id` (Foreign Key -> `bookings.id`, Nullable)
- `title` (String)
- `message` (Text)
- `type` (String)
- `is_read` (Boolean, default: false)
- `timestamps`

### `push_subscriptions`
- `id` (Primary Key, UUID)
- `user_id` (Foreign Key -> `users.id`)
- `endpoint` (String, Unique)
- `p256dh` (String)
- `auth` (String)
- `timestamps`

---

## 3. Autentikasi & Registrasi (Laravel Sanctum + NextAuth)

Otentikasi menggunakan **API Tokens (Bearer Token)** dari Laravel Sanctum, sangat fleksibel untuk Next.js dan *mobile app*.

### A. Alur Registrasi, Validasi Ketat, & Verifikasi Email
Prinsip utama: **"Never trust client input"**.
- Semua *input* dari *client* (Next.js) akan divalidasi dengan ketat menggunakan **Laravel Form Request Validation**.
- Backend hanya akan menyaring atribut yang dibutuhkan. Pada *Model* Laravel, properti `$fillable` akan dideklarasikan secara eksplisit untuk mencegah **Mass Assignment Vulnerability**.
- **Manual Register:** User mengirim `name`, `email`, dan `password`. Backend memvalidasi lalu menyimpannya (*password* di-*hash*). Karena ini input manual, akun berada dalam status **Unverified**. Sistem otomatis memicu pengiriman *Email Verification Link*. User tidak bisa mengakses fitur Dashboard penuh (dicegat oleh *middleware* `verified`) sebelum melakukan klik verifikasi.
- **Google OAuth Register/Login:** Next.js menangani *flow* Google. Setelah mendapatkan kredensial, data dikirim ke API Laravel (`/api/v1/auth/google`). Backend memvalidasinya. Jika akun baru, backend akan membuatkan akun dan secara otomatis mengisi `email_verified_at = now()` (Verifikasi di-*bypass* karena Google sudah memvalidasi kepemilikan email tersebut).

### B. Alur Login & Hak Akses
1. **Frontend (NextAuth):** User login (Manual / Google). Mengirim `POST` request ke `/api/v1/auth/login` atau `/api/v1/auth/google`.
2. **Backend (Laravel):** Melakukan validasi kredensial. Jika valid, sistem menerbitkan Token Sanctum (Personal Access Token).
3. **Frontend (NextAuth):** Token disimpan dalam *Session NextAuth* (biasanya di *JWT Callback*).
4. **Request Selanjutnya:** Setiap *request* ke *Private API* Laravel menyisipkan token tersebut di *header* `Authorization: Bearer {token}`.

---

## 4. Desain API Endpoints

### A. Public API (Tidak Butuh Token)
Endpoint ini digunakan untuk merender halaman *homepage* klien. Data diambil berdasarkan `slug` MUA.

- `GET /api/v1/mua/{slug}` -> Mendapatkan detail `mua_profiles`.
- `GET /api/v1/mua/{slug}/services` -> Mendapatkan daftar layanan milik MUA tersebut.
- `GET /api/v1/mua/{slug}/portfolios` -> Mendapatkan daftar portofolio MUA tersebut.
- `POST /api/v1/bookings` -> Endpoint untuk *client* membuat pesanan baru (membutuhkan `service_id` dan `user_id` dari MUA yang dituju).

### B. Private API (Butuh Bearer Token)
Endpoint ini digunakan oleh MUA di dalam halaman Dashboard mereka.

**Auth & Profile:**
- `POST /api/v1/auth/login` -> Endpoint login manual (mengeluarkan token).
- `POST /api/v1/auth/google` -> Endpoint login/register via Google OAuth.
- `POST /api/v1/auth/logout` -> Menghapus token aktif.
- `POST /api/v1/auth/email/verification-notification` -> Mengirim ulang email verifikasi.
- `GET /api/v1/auth/verify-email/{id}/{hash}` -> Memverifikasi email (diklik dari *inbox* email).
- `GET /api/v1/user/profile` -> Mengambil data profil sendiri (join `users` & `mua_profiles`).
- `PUT /api/v1/user/profile` -> Update profil (bio, slug, nama brand, dsb).

**Dashboard Management (CRUD MUA Sendiri):**
- `GET /api/v1/dashboard/portfolios`
- `POST, PUT, DELETE /api/v1/dashboard/portfolios/{id}`
- `GET /api/v1/dashboard/services`
- `POST, PUT, DELETE /api/v1/dashboard/services/{id}`
- `GET /api/v1/dashboard/bookings` -> Melihat semua pesanan masuk.
- `PUT /api/v1/dashboard/bookings/{id}/status` -> Mengubah status booking (misal dari PENDING ke DP_PAID).

---

## 5. Panduan Deployment ke Laravel Cloud

Laravel Cloud menyediakan infrastruktur *serverless-like* yang sangat dioptimasi untuk Laravel. Berikut langkah-langkah *best practice*:

### Persiapan Konfigurasi (`.env` dan CORS)
1. Buka `config/cors.php`, pastikan domain Next.js Anda (misal `https://mua-platform.com`) diizinkan pada bagian `allowed_origins`.
2. Pastikan file konfigurasi `.env` siap untuk menerima *environment variables* dari *dashboard* Laravel Cloud. Variabel krusial yang harus diset di Cloud nantinya:
   - `APP_ENV=production`
   - `APP_URL=https://api.mua-platform.com`
   - `FRONTEND_URL=https://mua-platform.com`
   - `DB_CONNECTION=mysql`
   - Kredensial DB dari Laravel Cloud (DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD).

### Setup di Laravel Cloud
1. Login ke Dashboard Laravel Cloud.
2. Hubungkan repository GitHub/GitLab Anda.
3. Buat *Project* baru dan pilih repository backend Laravel ini.
4. **Database:** Saat membuat project atau di menu *Resources*, *provision* atau buat database MySQL baru yang disediakan oleh Laravel Cloud.
5. **Environment Variables:** Masukkan `.env` *production* di tab Environment Variables di dashboard Laravel Cloud. Pastikan variabel koneksi database sudah terisi secara otomatis atau di-*link* dari *resource* MySQL yang baru dibuat.
6. **Deployment Hooks:** Pastikan di *Build/Deploy process* Laravel Cloud menjalankan perintah berikut (biasanya otomatis, namun pastikan log-nya berjalan):
   - `composer install --optimize-autoloader --no-dev`
   - `php artisan config:cache`
   - `php artisan route:cache`
   - `php artisan migrate --force` (untuk me-run migrasi tabel ke MySQL).

### Penyimpanan File (Storage)
Untuk menyimpan foto (portofolio, profil), karena Laravel Cloud mungkin bersifat *ephemeral* (meskipun Laravel Cloud mengelola hal ini dengan baik), *best practice*-nya adalah menggunakan layanan objek *storage* terpisah yang S3-compatible (seperti AWS S3, Cloudflare R2, atau DigitalOcean Spaces) dan mengaturnya di `.env`:
- `FILESYSTEM_DISK=s3`
- `AWS_ACCESS_KEY_ID=...`
- `AWS_SECRET_ACCESS_KEY=...`
- `AWS_DEFAULT_REGION=...`
- `AWS_BUCKET=...`
- `AWS_URL=...`

Dengan demikian, file foto *upload* dari user tidak akan hilang saat terjadi redeployment aplikasi.


---

## 6. Keamanan & Akses Data (Authorization)

Seluruh akses ke area Dashboard **wajib login** (dilindungi oleh *middleware* `auth:sanctum`). Untuk mengelola otorisasi tingkat lanjut secara rapi, kita akan menggunakan **Laravel Policy** yang dipadukan dengan **Spatie Laravel Permission** dan pencatatan riwayat aktivitas.

### A. Implementasi Laravel Policy & Isolasi Data
Saran penggunaan **Laravel Policy** (seperti `BookingPolicy`, `PortfolioPolicy`, `ServicePolicy`) sangat tepat dan merupakan *best practice* di Laravel untuk menangani keamanan Multi-Tenancy.
- Saat user melakukan `view`, `update`, atau `delete`, Policy akan memvalidasi apakah data tersebut valid dimiliki oleh lingkup MUA tersebut.
  - Untuk Role MUA: `return $user->id === $model->user_id;`
  - Untuk Role Staff: `return $user->mua_id === $model->user_id;`
- Jika validasi gagal, Laravel otomatis merespons dengan `403 Forbidden`, mencegah kebocoran data antar MUA.

### B. Spatie Permissions (Hak Akses Granular Staf)
Akses untuk *Role* `Staff MUA` tidak dibuat pukul rata. MUA dapat mengatur izin (*permission*) secara spesifik per fitur melalui `spatie/laravel-permission`:
- **`manage-bookings`**: Staf diizinkan melihat daftar pesanan dan mengubah status (pembuatan *notifikasi* akan otomatis berjalan beriringan jika izin ini diberikan).
- **`manage-services`**: Staf diizinkan menambah atau mengubah detail layanan/harga.
- **`manage-portfolios`**: Staf diizinkan mengunggah, mengedit, atau menghapus foto portofolio.
Kombinasi di dalam Policy nantinya akan menjadi sangat aman: 
`return ($user->mua_id === $booking->user_id) && $user->hasPermissionTo('manage-bookings');`

### C. Audit Trail (Activity Log)
Untuk menjaga keamanan ekstra dan transparansi (karena staf memiliki hak merubah data), sistem akan merekam riwayat perubahan CRUD (Create, Read, Update, Delete).
- **Pendekatan:** Sangat direkomendasikan menggunakan *package* `spatie/laravel-activitylog`.
- **Fungsi:** Setiap kali data (Booking, Layanan, Portofolio) diubah, log akan otomatis menyimpan **Siapa** (User ID / Role apa) yang merubah, **Kapan** perubahannya, dan **Apa** yang diubah (perbandingan nilai lama vs nilai baru).
- **Keuntungan:** MUA bisa memantau penuh rekam jejak staf (contoh: "Staf Budi mengubah status Booking #102 menjadi Canceled pada jam 14.00").

### D. Ringkasan Hak Akses
1. **Super Admin**: Memiliki akses global mengelola sistem utama dan langganan, terisolasi dari mencampuri transaksi spesifik klien.
2. **MUA (Pemilik Bisnis)**: Mengelola penuh datanya, mengatur hak akses spesifik untuk setiap staf, melihat riwayat aktivitas (*Activity Log*) stafnya, dan mengelola *Subscription*.
3. **Staff MUA**: Terikat pada `mua_id` bosnya. Bekerja secara silo dan hanya bisa mengeksekusi fitur yang diizinkan *(permissions)* oleh bosnya. Tidak bisa melihat staf dari MUA lain atau memanipulasi langganan MUA.
