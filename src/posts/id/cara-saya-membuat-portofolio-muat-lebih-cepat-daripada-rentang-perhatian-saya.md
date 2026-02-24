---
title: Bagaimana Saya Membuat Portofolio Saya Memuat Lebih Cepat daripada Rentang Perhatian Saya 🏃‍♂️💨
publishedAt: 2025-09-25
description: Saya membangun ulang situs portofolio dari Next.js ke Astro dan mengurangi JavaScript yang tidak perlu. Situs jadi lebih cepat, lebih mudah dirawat, dan tetap menjalankan bagian interaktif yang saya butuhkan.
tags: ['astro', 'nextjs', 'react', 'performa', 'seo']
keywords: 'astro js portofolio, astro vs nextjs, performa astro, nextjs situs statis, react dengan astro, astro peningkatan seo, arsitektur islands astro, kecepatan situs astro, astro untuk portofolio, alternatif nextjs'
readTime: 5
lang: id
key: portfolio-speed
---

Saya pakai Next.js bertahun-tahun. Nyaman, lengkap fiturnya, dan cocok kalau butuh server rendering atau API. Untuk portofolio saya, ternyata saya membawa terlalu banyak beban untuk sesuatu yang hampir tidak berubah.

Suatu sore, sambil nunggu kopi selesai, saya memutuskan untuk membangun ulang situs pakai Astro. Tujuannya sederhana: halaman harus terasa instan, dan komponen kecil yang interaktif tetap bekerja tanpa menyeret runtime JavaScript besar.

Hasilnya terasa langsung — bukan karena trik rahasia, tapi karena saya fokus pada tiga hal sederhana: kirim lebih sedikit JS, lazy-load yang tidak terlihat, dan pisahkan bagian interaktif. Sekarang situs terbuka cepat, UI terasa lebih responsif, dan saya tenang karena lebih sedikit yang perlu dipelihara.

---

## Kenapa memilih Astro?

Ide utama Astro gampang: sebagian besar HTML bersifat statis, dan Anda hanya melakukan hydrate pada komponen yang perlu JavaScript.

Praktisnya:

- Halaman jadi lebih ringan.
- HTML lebih ramah untuk SEO dan preview sosial.
- Browser bekerja lebih sedikit di muka, sehingga pengalaman terasa lebih cepat.

Untuk portofolio yang isinya mayoritas statis, ini masuk akal. Saya tetap bisa pakai React untuk bagian yang memang butuh interaksi, tanpa mengubah tiap halaman jadi single-page app kecil.

---

## Langkah yang saya ambil

Kalau kamu mau coba rewrite, ini checklist praktis yang saya pakai — sederhana dan bisa langsung dipraktikkan:

- Audit bundle: temukan skrip besar dan kode yang tidak terpakai.
- Konversi halaman ke Astro; gunakan islands (partial hydration) untuk komponen yang perlu.
- Lazy-load gambar dan aset non-kritis.
- Ganti beberapa widget kecil dengan HTML/CSS jika memungkinkan.
- Biarkan form kontak dan UI interaktif tetap sebagai komponen React kecil.

Saya juga sempat merusak layout di beberapa tempat pada percobaan pertama, tapi itu cepat diperbaiki — trade-off yang sepadan dengan peningkatan performa.

---

## Next.js tetap punya tempatnya

Next.js masih hebat untuk aplikasi yang butuh routing, SSR, atau banyak state di klien. Peralihan ini bukan menjelekkan Next.js, melainkan memilih alat yang tepat untuk kebutuhan. Astro membiarkan saya mempertahankan bagian terbaik React di tempat yang perlu, dan membuang default berat yang tidak diperlukan.

---

## Hasil yang nyata

- Halaman terasa jauh lebih cepat bagi pengunjung.
- Lebih sedikit JavaScript yang dikirim berarti lebih sedikit potensi bug.
- Skor Lighthouse dan preview sosial membaik.
- Kode lebih sederhana dan lebih mudah dimengerti.

---

## Penutup

Jika proyekmu kebanyakan berisi konten statis — portofolio, dokumentasi, atau situs marketing kecil — pikirkan lagi: apakah kamu benar-benar butuh framework aplikasi penuh? Kadang solusi tercepat dan paling efektif adalah mengurangi kompleksitas, bukan menambahnya.

Mulai kecil: konversi satu halaman, pindahkan satu widget ke island, lalu ukur. Kamu mungkin kaget seberapa lega pengalaman pengguna jadi hanya dengan membiarkan browser melakukan lebih sedikit pekerjaan di awal.
