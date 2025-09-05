---
title: Bagaimana Saya Membuat Portofolio Saya Memuat Lebih Cepat daripada Rentang Perhatian Saya 🏃‍♂️💨
publishedAt: 2025-04-24
description: Saya membangun ulang website portofolio saya dari Next.js ke Astro.js dan mendapatkan peningkatan performa yang besar. Next.js luar biasa untuk web application, tapi untuk situs statis seperti portofolio saya, Astro memberikan waktu muat yang super cepat, SEO yang lebih baik, dan kode yang lebih ramping—sambil tetap memungkinkan saya menggunakan React untuk komponen interaktif.
tags: ['astro', 'nextjs', 'react', 'performa', 'seo']
keywords: 'astro js portofolio, astro vs nextjs, performa astro, nextjs situs statis, react dengan astro, astro peningkatan seo, arsitektur islands astro, kecepatan situs astro, astro untuk portofolio, alternatif nextjs'
readTime: 5
lang: id
---

Kalau kamu pernah membangun portofolio sebagai developer, kamu mungkin tahu siklusnya: ingin terlihat keren, pamer skill, dan mungkin selipkan animasi kece ✨. Selama beberapa tahun terakhir, saya selalu menggunakan **Next.js** setiap kali butuh membangun sesuatu—portofolio, dashboard, aplikasi, apa saja.

Tapi begini… **Next.js memang luar biasa untuk membangun web application** (bayangkan dashboard, produk SaaS, dll.), tapi portofolio saya? Itu pada dasarnya hanyalah sekumpulan halaman statis yang _hampir tidak pernah berubah_. Menggunakan framework web app penuh untuk situs yang sebagian besar statis rasanya seperti membawa peluncur roket ke pertarungan bantal. 🚀🪶

Jadi saya memutuskan untuk membangun ulang portofolio saya dengan **Astro.js**—dan wow. Lonjakan performanya luar biasa. Halaman sekarang _super cepat_, skor Lighthouse saya hijau semua, dan SEO akhirnya berhenti marah-marah ke saya.

---

## Kenapa Astro.js?

Astro punya konsep keren bernama **“Islands Architecture”**. Singkatnya, secara default Astro hampir tidak mengirimkan JavaScript sama sekali. Semuanya berupa HTML statis sampai kamu secara eksplisit bilang ke Astro, “Hei, bagian ini harus interaktif.”

Artinya:

- **Halaman super ringan** 🪶
- **SEO lebih baik** karena crawler Google suka HTML statis 🕷️
- **Loading lebih cepat** karena browser kamu tidak tersedak JavaScript yang tidak perlu

Untuk situs portofolio (yang 95% isinya konten statis), ini _sempurna_.

---

## Tapi Saya Masih Cinta Next.js ❤️

Jangan salah paham—Next.js tetap salah satu tools favorit saya. Saya pakai untuk aplikasi sungguhan yang butuh routing, server-side rendering, API routes, dll. Bahkan di portofolio Astro baru saya, saya tetap menggunakan **komponen React** untuk interaktivitas di sisi client. Astro bikin super gampang menambahkan React (atau bahkan Vue/Svelte/Solid) di mana pun kamu butuh.

Jadi ini bukan soal “Astro vs Next.js” — tapi lebih ke **memilih alat yang tepat untuk kebutuhan**. Portofolio saya memang tidak butuh semua fitur berat khas aplikasi yang dibawa Next.js.

---

## Hasilnya 🚀

- Loading halaman hampir instan (serius, kedip mata aja bisa kelewat).
- Skor SEO saya naik drastis (Google akhirnya suka sama saya 👀).
- Skor performa Lighthouse tembus 💯 (chef’s kiss 👨‍🍳💋).
- Rasanya lebih lega karena tahu situs saya tidak over-engineered untuk kebutuhan yang sebenarnya.

---

## Penutup

Sebagai developer, mudah sekali untuk selalu kembali ke framework yang paling nyaman buat kita. Bagi saya, itu selalu Next.js. Tapi kadang, mundur sebentar dan bertanya _“Proyek ini sebenarnya butuh apa?”_ bisa memberi hasil yang lebih baik—dan mengajarkan sesuatu yang baru di sepanjang jalan.

👉 Jadi kalau kamu sedang membangun sesuatu yang sebagian besar statis, coba deh **Astro.js**. Pengguna kamu (dan skor Lighthouse kamu) pasti akan berterima kasih.
