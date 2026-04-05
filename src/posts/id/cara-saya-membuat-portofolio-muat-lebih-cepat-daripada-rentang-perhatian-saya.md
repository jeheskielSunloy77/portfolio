---
title: Bagaimana Saya Membuat Portofolio Saya Memuat Lebih Cepat daripada Rentang Perhatian Saya 🏃‍♂️💨
publishedAt: 2025-09-25
description: Saya memindahkan portofolio dari Next.js ke Astro karena website pribadi tidak butuh framework aplikasi yang terlalu berat. Hasilnya lebih ringan, lebih cepat dibuka, dan jauh lebih masuk akal untuk dirawat.
tags: ['astro', 'nextjs', 'react', 'performa', 'seo']
keywords: 'astro js portofolio, astro vs nextjs, performa astro, nextjs situs statis, react dengan astro, astro peningkatan seo, arsitektur islands astro, kecepatan situs astro, astro untuk portofolio, alternatif nextjs'
readTime: 5
lang: id
key: portfolio-speed
related: ['mendesain-ulang-portofolio-memberi-ruang-untuk-hal-yang-penting']
---

Saya lama memakai Next.js untuk hampir semua hal. Framework itu bagus, matang, dan saya sudah sangat terbiasa dengannya. Masalahnya, portofolio saya tidak benar-benar membutuhkan sebagian besar yang ditawarkannya.

Isi situs itu sederhana: halaman statis, beberapa gambar, dan sedikit interaksi. Tapi arsitekturnya masih membawa kebiasaan dari dunia aplikasi. JavaScript di klien lebih banyak dari yang perlu, struktur lebih rumit, dan beban maintenance terasa lebih besar daripada nilai yang saya dapat.

Jadi saya membangun ulang dengan Astro. Bukan karena sedang ramai, tapi karena lebih cocok dengan pekerjaannya.

## Masalah utamanya bukan sekadar performa

Orang sering membahas kecepatan situs seolah semuanya dimulai dari skor audit. Buat saya, semuanya dimulai dari keputusan teknis.

Saya melihat portofolio itu lalu bertanya: kenapa saya memakai solusi yang bentuknya seperti aplikasi untuk website yang perilakunya lebih mirip dokumen?

Pertanyaan itu mengubah arah rewrite sepenuhnya. Tujuannya bukan lagi "mengoptimalkan setup yang ada." Tujuannya menjadi "berhenti melakukan hal yang sebenarnya tidak perlu."

Begitu sudut pandangnya berubah, jawabannya juga jadi jelas:

- Render sebanyak mungkin sebagai HTML statis.
- Pakai JavaScript hanya di bagian yang memang butuh interaksi.
- Jangan perlakukan setiap halaman seperti mini app.

Di situlah performa yang sehat biasanya dimulai. Dari pengurangan, bukan penambahan.

## Kenapa Astro terasa masuk akal

Astro punya bias yang saya suka: statis dulu, hydrate seperlunya.

Untuk portofolio, itu tepat. Saya masih bisa memakai React di bagian kecil yang memang membutuhkan interaksi, tanpa menyeret seluruh halaman masuk ke runtime yang tidak memberi manfaat nyata.

Hasilnya terasa cepat karena browser punya pekerjaan lebih sedikit, bukan karena saya sibuk menyiasati masalah yang saya ciptakan sendiri.

Saya lebih suka arsitektur yang menghapus masalah dari awal daripada arsitektur yang menciptakan masalah lalu memberi alat untuk menambalnya.

## Perubahan yang benar-benar saya lakukan

Rewrite ini bukan proyek dramatis. Isinya keputusan-keputusan membosankan, dan biasanya justru di situlah engineering yang bagus hidup.

- Saya pindahkan halaman berbasis konten ke Astro.
- Komponen interaktif saya pisahkan dan buat sekecil mungkin.
- Aset yang tidak langsung dibutuhkan saya lazy-load.
- Beberapa detail UI yang terasa keren di kode saya buang karena nilainya kecil untuk pengunjung.
- Permukaan maintenance saya perkecil dengan sengaja.

Tidak ada trik rahasia di sini. Justru itu poinnya.

## Pelajaran yang paling berguna

Pelajaran utamanya bukan soal Astro atau Next.js. Pelajarannya soal disiplin memilih alat.

Banyak engineer, termasuk saya, kadang terlalu lama bertahan di stack yang familiar meski masalahnya sudah berubah. Kita menyebutnya konsistensi. Kadang itu hanya kebiasaan yang sedang mencari pembenaran.

Next.js tetap sangat tepat saat saya butuh routing kompleks, logika di server, auth flow, atau state klien yang kaya. Saya tidak tertarik ikut perang framework. Saya tertarik pada kecocokan.

Untuk portofolio ini, Astro lebih tepat karena membiarkan situsnya menjadi dirinya sendiri.

## Apa yang membaik

- Halaman terasa lebih instan.
- HTML lebih sederhana, jadi SEO dan preview sosial ikut terbantu.
- JavaScript yang dikirim lebih sedikit, artinya lebih sedikit potensi masalah.
- Kode lebih mudah dipahami karena arsitekturnya selaras dengan bentuk kontennya.

Bagian terbaiknya bukan angka di laporan. Bagian terbaiknya adalah situs ini terasa lebih tenang, dan basis kodenya juga begitu.

## Kalau saya harus memberi saran

Kalau kamu sedang membangun portofolio, dokumentasi, atau situs yang berat di konten, coba tanya satu hal sebelum otomatis memakai stack andalanmu: proyek ini benar-benar butuh apa, dan apa yang sebenarnya hanya kamu bawa dari kebiasaan?

Framework yang kita kuasai memang paling gampang dibenarkan. Yang lebih sulit adalah menahan diri.

Rewrite ini mengingatkan saya bahwa kedewasaan teknis bukan cuma soal tahu lebih banyak tools. Kadang justru soal tahu kapan sebuah tool tidak perlu dipakai.
