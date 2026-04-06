---
title: Cara Saya Menjaga Kode Go Tetap Bersih (Tanpa Jadi Gila) 🧹
publishedAt: 2025-03-02
description: 'Saya membangun go-kickstart untuk men-scaffold monorepo full-stack Go dan React skala produksi dengan Clean Architecture yang pragmatis, boundary yang jelas, dan struktur yang tetap masuk akal saat aplikasi membesar.'
tags: ['go', 'design patterns', 'clean architecture']
keywords: 'struktur project golang, monorepo go, clean architecture golang, aplikasi fullstack golang, monorepo react golang, cli scaffolding golang, golang production ready, arsitektur backend go, monorepo go react, clean architecture go'
readTime: 10
lang: id
key: go-clean-code
---

Kalau orang bicara soal struktur project Go, biasanya obrolannya jatuh ke dua kubu.

Kubu pertama bilang, "yang penting simpel," lalu berhenti di situ. Kubu kedua datang membawa diagram dengan layer sebanyak rak kantor.

Saya tidak terlalu tertarik dengan keduanya.

Yang saya pedulikan adalah struktur yang masih masuk akal ketika project sudah lewat fase CRUD, mulai punya frontend, authentication, background job, email workflow, shared package, dan engineer kedua yang tidak ikut mendengar penjelasan arsitektur di hari pertama.

Itulah alasan saya membangun [`go-kickstart`](https://github.com/jeheskielSunloy77/go-kickstart): CLI yang men-scaffold monorepo full-stack skala produksi dengan backend Go, frontend React, dan susunan codebase yang mengikuti Clean Architecture secara pragmatis, bukan sekadar terlihat rapi di diagram.

## Kenapa saya membangun go-kickstart

Saya terus melihat masalah yang sama.

Memulai project Go itu mudah. Memulai project Go yang tetap sehat setelah fitur-fitur nyata mulai datang, itu yang sulit.

Bagian sulitnya jarang ada di `go mod init`. Bagian sulitnya ada di keputusan seperti:

- business logic sebaiknya tinggal di mana
- infrastructure masuk lewat batas yang seperti apa supaya tidak bocor ke mana-mana
- bagaimana menjaga HTTP handler tetap tipis
- bagaimana menyusun auth, akses database, job queue, dan email workflow
- bagaimana menambah frontend tanpa membuat repo terasa seperti gudang campur aduk

Saya capek mengulang keputusan itu dari nol, jadi saya ubah struktur yang saya percaya menjadi sebuah CLI.

`go-kickstart` bukan generator main-main. CLI ini men-scaffold monorepo yang memang disiapkan untuk dikembangkan. Hasilnya berisi Go API, React app, shared package, dan fondasi yang cukup opinionated untuk mulai membangun sesuatu yang benar-benar dipakai.

## Struktur yang benar-benar saya percaya

Saya suka Clean Architecture kalau ia dipakai sebagai alat, bukan kostum.

Artinya buat saya cukup jelas:

- aturan domain harus tetap terpisah dari framework
- layer transport harus menerjemahkan, bukan mengambil keputusan bisnis
- infrastructure harus bisa diganti tanpa memaksa indirection ke semua tempat
- dependency harus mengarah ke dalam
- alur kode tetap harus enak diikuti tanpa membuka lima belas file untuk satu request

Poin terakhir itu sering diremehkan.

Sebuah struktur baru layak disebut "clean" kalau engineer lain bisa masuk ke project dan cepat paham apa harus ditaruh di mana. Kalau secara teori arsitekturnya murni tapi secara praktik melelahkan untuk dinavigasi, berarti strukturnya sudah gagal.

## Apa yang dihasilkan go-kickstart

Secara garis besar, saya ingin project hasil scaffolding mencerminkan cara aplikasi full-stack yang serius biasanya tumbuh:

```text
monorepo/
├── apps/
│   ├── api/
│   │   ├── cmd/
│   │   ├── internal/
│   │   │   ├── domain/
│   │   │   ├── usecase/
│   │   │   ├── repository/
│   │   │   ├── delivery/
│   │   │   └── infrastructure/
│   │   └── migrations/
│   └── web/
│       └── src/
├── packages/
│   ├── types/
│   └── config/
└── turbo.json
```

Nama folder persisnya bukan bagian yang paling penting. Yang penting adalah niat di balik susunannya.

Sisi Go memegang aturan bisnis, orkestrasi aplikasi, dan boundary infrastructure. Sisi React memegang pengalaman pengguna. Shared package dipakai untuk mengurangi duplikasi saat memang ada kontrak lintas aplikasi yang layak dibagi.

Ini jenis struktur yang ingin saya warisi di tim, bukan cuma yang kelihatan bagus di screenshot.

## Clean Architecture versi saya itu pragmatis

Saya tidak ingin handler langsung bicara ke database. Tapi saya juga tidak ingin ada lima layer abstraksi untuk fitur yang sebenarnya bisa hidup nyaman di satu service yang jelas.

Jadi kode hasil scaffolding ini sengaja mengambil jalan tengah.

Entity domain menyimpan bahasa inti bisnis. Use case mengorkestrasi behavior aplikasi. Repository mengabstraksikan persistence saat boundary-nya memang berguna. Layer delivery mengurus HTTP dan parsing request. Package infrastructure menyimpan detail implementasi seperti database client, cache, mailer, dan background worker.

Kedengarannya familiar karena prinsipnya memang familiar. Bedanya ada pada seberapa keras saya menghindari seremoni yang tidak perlu.

Saya tidak merasa setiap package harus punya interface.

Saya juga tidak merasa setiap dependency perlu diabstraksikan "siapa tahu nanti dibutuhkan."

Yang saya anggap penting adalah boundary yang jelas ketika boundary itu memang melindungi inti aplikasi dari kebisingan framework dan perubahan infrastruktur.

## Backend harus gampang dipahami

Kode Go yang dihasilkan dibentuk dengan satu tujuan praktis: saat kita mengikuti satu fitur dari request ke business rule lalu ke persistence, jalurnya harus terasa jelas.

Biasanya itu berarti:

- handler tipis
- use case yang fokus
- repository dengan tanggung jawab konkret
- wiring dependency yang eksplisit
- validasi dan aturan bisnis yang dekat dengan domain yang dijaga

Saya ingin kodenya mudah diuji, tapi saya juga ingin kodenya mudah dijelaskan.

Menurut saya itu kemampuan engineering yang sering diremehkan. Recruiter mungkin melihat daftar teknologi. Engineer yang mewawancarai biasanya akan melihat judgment. Struktur project bisa mengatakan banyak hal tentang judgment itu.

## Frontend juga bagian dari percakapan

Banyak artikel tentang arsitektur Go diam-diam bersikap seolah frontend itu urusan orang lain.

Menurut saya itu tidak cocok dengan cara tim modern membangun produk.

`go-kickstart` men-scaffold monorepo Go dan React karena pekerjaan full-stack butuh boundary yang jelas di dua sisi. Backend bisa mengekspos kontrak yang stabil. Frontend bisa bergerak cepat tanpa harus menebak-nebak keputusan backend. Shared types dan shared tooling membantu repo ini berperilaku seperti satu sistem, bukan dua aplikasi yang kebetulan tinggal di folder yang sama.

Buat saya, itu juga bagian dari menulis kode Go yang bersih. Struktur backend yang baik seharusnya mendukung keseluruhan produk, bukan mengisolasi diri darinya.

## Kenapa saya memilih CLI, bukan sekadar contoh di artikel

Siapa pun bisa menulis artikel yang berkata, "ini struktur folder yang saya suka."

Saya ingin membuktikan bahwa strukturnya bisa diulang.

Membangun CLI memaksa saya berpikir melampaui satu repo. Saya harus mengenkode keputusan-keputusan seperti:

- default mana yang memang layak distandardisasi
- bagian mana yang sebaiknya opsional
- seberapa banyak setup yang pantas didapat project baru di hari pertama
- bagaimana menyeimbangkan fleksibilitas dengan convention yang masuk akal

Menurut saya ini tantangan engineering yang lebih menarik daripada sekadar menamai folder.

Scaffolder yang bagus adalah pertemuan antara architecture, automation, dan empati terhadap developer experience.

## Hal yang saya harap recruiter lihat dari project seperti ini

Kalau seseorang mendarat di artikel ini atau repo-nya, saya tidak butuh mereka pulang dengan kesan, "oh, dia hafal istilah Clean Architecture."

Saya ingin mereka melihat sesuatu yang lebih berguna:

- saya berpikir dalam sistem, bukan file yang berdiri sendiri
- saya peduli pada maintainability setelah rilis pertama
- saya bisa mendesain workflow backend dan frontend sekaligus
- saya mengubah engineering pain yang berulang menjadi tooling yang bisa dipakai lagi
- saya menghargai codebase yang benar-benar nyaman dihuni oleh tim

Itulah yang diwakili `go-kickstart` buat saya. Bukan cuma CLI, tapi juga sudut pandang tentang bagaimana software produksi seharusnya dimulai.

## Patokan yang terus saya pakai

Struktur Go yang baik harus menurunkan biaya perubahan.

Itu patokannya.

Kalau sebuah pola membuat onboarding lebih sulit, debugging lebih lambat, atau pengerjaan fitur lebih rapuh, saya tidak terlalu peduli seberapa keren tampilannya di diskusi arsitektur.

Kalau sebuah struktur membantu tim bergerak lebih cepat tanpa membuat codebase berantakan tiga bulan kemudian, itu jenis "clean" yang saya cari.

Dan itu juga alasan saya membangun `go-kickstart`.

Saya ingin punya cara untuk memulai dari codebase yang sudah menghormati boundary, siap mendukung pekerjaan produk yang nyata, dan tetap enak dibaca saat tekanan datang.

Bagi saya, di situlah bedanya antara sekadar bicara soal clean Go architecture dan benar-benar memakainya.
