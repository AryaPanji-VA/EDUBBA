# EDUBBA — approved theme system

Bentuk master: option 02 comfy yang sudah disetujui. Semua posisi, radius, path huruf, transform, dan viewBox dipertahankan persis. Perbedaan antar tema hanya warna dan metadata nama.

- after-dark: warna original yang disetujui.
- signal: warna diambil dari screenshot 002721.
- deep-space: warna diambil dari screenshot 002732.
- Dua screenshot menggunakan mode Dark; varian baru di paket ini ditujukan untuk mode tersebut, bukan hasil verifikasi mode Light.
- Warna dari screenshot merupakan sampel piksel, bukan token source code website.

Setiap folder berisi edubba-logo.svg (horizontal transparan), edubba-mark.svg (simbol transparan), edubba-appicon.svg (background rounded square), beserta PNG. Wordmark berupa path, tanpa dependensi font.

Untuk sidebar atas gunakan logo horizontal, width 180px, height auto. Untuk sidebar collapsed gunakan mark dengan width 32px dan height auto. Bentuk sengaja tidak diubah demi konsistensi versi yang disetujui.

Simpan folder paket di public/brand/edubba. Ganti URL sesuai tema aplikasi:

```js
const logoThemes = {
  "after-dark": "/brand/edubba/after-dark/edubba-logo.svg",
  signal: "/brand/edubba/signal/edubba-logo.svg",
  "deep-space": "/brand/edubba/deep-space/edubba-logo.svg",
};
const logoSrc = logoThemes[theme] ?? logoThemes["after-dark"];
```

```html
<img src="/brand/edubba/signal/edubba-logo.svg"
     alt="EDUBBA" width="180" style="height:auto;display:block">
```

brand-colors.json dan brand-colors.css menyimpan warna resmi paket ini. CSS variables di halaman tidak masuk ke SVG eksternal yang dimuat melalui img; gunakan pergantian URL di atas. Tidak perlu filter CSS yang bisa mengubah warna secara tidak presisi.

Original option 01, approved option 02, dan app icons sebelumnya tetap tersedia di folder sebelumnya.
