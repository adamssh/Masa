# ⏳ Masa - Focus Stopwatch

**Masa** adalah ekstensi peramban (*browser extension*) yang dirancang khusus untuk menjaga fokus dan mencegah distraksi saat bekerja atau belajar (*Deep Work*). Masa akan mencatat dan memperlihatkan berapa banyak waktu Anda yang terbuang di situs web non-produktif.

## ✨ Fungsi Utama

- **Sistem Whitelist Ketat:** Hanya website yang Anda daftarkan di dalam *Whitelist* (Daftar Putih) yang dianggap produktif. Segala website lain di luar daftar tersebut dianggap sebagai distraksi.
- **Timer Waktu Terbuang (Global):** Saat Anda membuka situs web yang membuat tidak fokus (misal: sosial media, hiburan), Masa akan memunculkan *stopwatch* merah melayang di pojok layar Anda. Waktu dihitung secara akumulatif, artinya jika Anda pindah dari Twitter ke YouTube, waktunya akan terus bertambah.
- **Toggle Mode Kerja (On/Off):** Dilengkapi dengan saklar utama. Jika Anda sudah selesai bekerja atau belajar, Anda bisa mematikan ekstensi ini dengan satu klik, dan semua peringatan akan hilang seketika.
- **100% Aman & Privat:** Ekstensi ini berjalan sepenuhnya secara luring (*offline*) di komputer Anda, tidak ada pelacakan data, dan tidak ada komunikasi ke server eksternal mana pun.

## ⚙️ Cara Kerja

1. **Pemantauan Latar Belakang:** Service Worker (`background.js`) ekstensi ini selalu memantau perpindahan tab dan jendela browser.
2. **Evaluasi Instan:** Begitu browser Anda menatap tab sebuah website, Masa akan mengecek *domain* URL tersebut ke dalam daftar *whitelist*. 
3. **Injeksi Tampilan Paksa (Suntik Dinamis):** Jika situs tersebut tidak terdaftar, Masa akan menyuntikkan tampilan peringatan (`content.js` dan `content.css`) secara dinamis ke layar Anda detik itu juga, **bahkan untuk tab-tab lama** yang sudah terbuka sebelum ekstensi dipasang.
4. **Respon Waktu-Nyata (Real-time):** Apabila Anda merubah aturan daftar *whitelist* atau mematikan ekstensi, tampilan peringatan (*overlay*) di layar akan langsung menyesuaikan diri atau menghilang seketika tanpa perlu memuat ulang (*refresh*) halaman.

## ⌨️ Shortcut (Pintasan Keyboard)

Cara tergampang dan tercepat untuk menggunakan ekstensi ini:

*   **Menambahkan Situs ke Whitelist Seketika:**
    1. Sedang berada di website produktif tapi peringatan Masa muncul?
    2. **Klik Kanan** di area mana saja pada halaman website tersebut.
    3. Tekan tuts **`M`** pada keyboard Anda.
    4. *(Website tersebut otomatis masuk ke daftar produktif dan kotak peringatan akan seketika menghilang)*.

*   **Menambah lewat Popup:**
    *   Klik ikon **M** ekstensi di pojok kanan atas browser.
    *   Ketik domain (contoh: `wikipedia.org`), lalu tekan tombol **`Enter`** (tidak perlu mengeklik tombol Tambah).

## 🛠️ Cara Instalasi (Pengembang Lokal)

1. Buka browser Google Chrome / Brave / Microsoft Edge.
2. Masukkan alamat ini di *address bar*: `chrome://extensions/`
3. Nyalakan mode **Developer mode** (Mode Pengembang) di sudut kanan atas.
4. Klik tombol **Load unpacked** (Muat yang belum dikemas).
5. Pilih folder proyek `Masa` ini.
6. Ekstensi siap menjaga fokus Anda! 🚀

---
*Dibuat untuk memaksimalkan produktivitas Anda tanpa kompromi.*

