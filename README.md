# 💬 ChatApp

**ChatApp** adalah aplikasi chat modern berbasis web yang dibangun menggunakan **NestJS** (backend), **ReactJS** (frontend), dan **MongoDB** sebagai database utama. Aplikasi ini mendukung komunikasi realtime menggunakan **Socket.IO**, menjadikannya sangat responsif dan interaktif.

---

## 🚀 Fitur Unggulan

### 🔐 Autentikasi Aman
- Registrasi dengan validasi ketat: username, email, dan nomor telepon harus unik.
- Login dengan enkripsi password menggunakan **bcrypt**.
- Perlindungan sesi menggunakan **JWT (JSON Web Token)**.

### 💬 Chat Realtime
- Kirim dan terima pesan dalam grup secara realtime.
- Bisa membalas dan mengedit pesan.
- Menandai pesan sebagai sudah dibaca.
- Melihat jumlah pesan yang belum dibaca.
- Notifikasi saat teman sedang mengetik.
- Pin pesan penting di dalam room agar tidak tenggelam.

### 👥 Kelola Room (Grup Chat)
- Buat room baru dengan cepat.
- Tambahkan atau hapus anggota room (hanya oleh admin).
- Ganti nama room sesuai kebutuhan.
- Hapus room jika sudah tidak digunakan.
- Lihat semua room yang kamu ikuti beserta detailnya.

### 👤 Kelola Pengguna
- Setiap user memiliki profil lengkap: nama lengkap, username, email, nomor HP, tanggal lahir, dan foto profil.
- Lihat siapa saja yang sedang online di dalam room.

---

## 🛠️ Teknologi yang Digunakan

| Fitur        | Teknologi           |
|-------------|---------------------|
| Backend     | NestJS (Node.js)    |
| Frontend    | ReactJS             |
| Realtime    | Socket.IO           |
| Database    | MongoDB             |
| Keamanan    | JWT & Bcrypt        |

---
