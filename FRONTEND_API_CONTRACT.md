# Kontrak Integrasi Frontend Laravel

Frontend memakai `NEXT_PUBLIC_API_URL` sebagai base URL dan mengirim token Sanctum melalui header `Authorization: Bearer <token>` untuk seluruh endpoint dashboard.

Selain endpoint yang sudah tercantum dalam `BACKEND_ARCHITECTURE.md`, fitur UI yang dipertahankan membutuhkan endpoint berikut:

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| POST | `/auth/register` | Registrasi manual dengan field `name`, `email`, `password`, dan `password_confirmation`, lalu mengirim verifikasi email |
| PUT | `/user/profile` | Membuat atau memperbarui profil awal saat onboarding |
| GET | `/bookings/check?username={username}&custom_code={customCode}` | Mengambil detail booking publik untuk halaman sukses booking |
| GET | `/dashboard/services/{id}` | Detail dan form edit layanan |
| GET | `/dashboard/portfolios/{id}` | Detail portofolio |
| GET | `/dashboard/bookings/{id}` | Detail dan form edit booking |
| PUT | `/dashboard/bookings/{id}` | Memperbarui booking; role MUA dapat mengirim `status`, `event_date`, dan `event_time`, sedangkan role berizin lainnya hanya dapat mengubah `status` |
| GET | `/dashboard/notifications` | Daftar notifikasi tenant aktif |
| PUT | `/dashboard/notifications/{id}/read` | Tandai satu notifikasi milik user aktif telah dibaca |
| PUT | `/dashboard/notifications/read-all` | Tandai seluruh notifikasi `is_read = false` milik user aktif telah dibaca |
| POST | `/dashboard/push-subscriptions` | Simpan Web Push subscription |
| DELETE | `/dashboard/push-subscriptions` | Hapus subscription berdasarkan `endpoint` pada body |

Endpoint daftar booking menerima parameter `page`, `per_page`, `search`, dan `status`. Respons boleh berupa array, Laravel paginator, atau API Resource dengan properti `data`; adaptor Axios frontend menangani ketiganya.

Pembaruan booking menggunakan satu endpoint. `event_date` dikirim dalam format `YYYY-MM-DD` dan `event_time` dalam format `HH:MM:SS`. Backend menentukan field yang boleh diperbarui berdasarkan role dan memastikan booking berasal dari tenant pengguna yang sedang login.

Upload portofolio memakai `multipart/form-data` dengan field `image`, `title`, `category`, dan `alt_text`. Penyimpanan file sepenuhnya menjadi tanggung jawab Laravel filesystem disk.

Onboarding profil mengirim `username`, `brand_name`, `service_area` dalam bentuk array string, dan `whatsapp_number`. Username menjadi identitas halaman publik dan harus unik.
