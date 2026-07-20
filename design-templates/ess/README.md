# Template Gambar - Employee Self Service (ESS)

Semua ukuran di sini SUDAH PAS dengan yang dipakai aplikasi OneAccess.
Tinggal buka `.svg` di Figma (drag ke canvas), ganti isinya, lalu export ke ukuran yang sama.
Versi `.png` disertakan kalau kamu mau langsung copy/lihat contohnya.

| File | Ukuran | Rasio | Dipakai untuk | Format export |
|---|---|---|---|---|
| `poster-*` | 600 x 900 | 2:3 potret | Tile poster di shelf (dashboard/katalog) | PNG/JPG, boleh 2x (1200x1800) |
| `artwork-*` | 2400 x 1200 | 2:1 lanskap | Backdrop hero halaman detail | JPG/PNG |
| `logo-*` | 512 x 192 | - | Logo lockup di hero | **PNG transparan**, warna terang |

## Catatan penting
- **Poster**: taruh judul di 1/3 bawah (aplikasi kasih scrim gelap di bawah).
- **Artwork**: biarkan sisi **kiri-bawah tenang** (di situ judul + tombol app muncul); subjek/foto utama taruh di **kanan**.
- **Logo**: WAJIB latar transparan + warna terang (ditaruh di atas artwork gelap).
- Field di database nanti: `poster_url`, `artwork_url`, `logo_url` (per aplikasi).

Guide (garis putus-putus) di dalam SVG = HAPUS/sembunyikan sebelum export.
