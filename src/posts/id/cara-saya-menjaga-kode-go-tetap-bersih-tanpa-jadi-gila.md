---
title: Cara Saya Menjaga Kode Go Tetap Bersih (Tanpa Jadi Gila) 🧹
publishedAt: 2025-03-02
description: 'Saya berhenti memaksakan Clean Architecture versi textbook ke proyek Go dan memilih struktur yang lebih ringan: service, interface seperlunya, dan wiring yang eksplisit. Hasilnya lebih mudah diuji dan jauh lebih enak dirawat.'
tags: ['go', 'design patterns', 'clean architecture']
keywords: 'golang architecture, go clean code, golang project structure, go services pattern, golang repositories, go best practices, golang testing, go code organization, clean architecture go, golang design patterns'
readTime: 9
lang: id
key: go-clean-code
---

Saya suka kode yang rapi. Saya tidak suka arsitektur yang terlalu sibuk ingin terlihat pintar.

Dulu saya sering memaksa setiap proyek Go masuk ke versi Clean Architecture yang tampak meyakinkan di diagram, tapi terasa canggung saat dipakai. Layer terlalu banyak, abstraksi terlalu dini, dan package muncul bukan karena kebutuhan kode, melainkan karena kebutuhan presentasi.

Hasilnya hampir selalu sama: development melambat, keterbacaan turun, dan codebase terlihat serius jauh sebelum benar-benar pantas.

Sekarang aturan saya lebih sederhana. Di Go, struktur harus membantu saya memahami kode saat sedang lelah, bukan menguji kesabaran saya. Kalau tidak, saya tidak tertarik.

## Yang biasanya salah saat Clean Architecture diterapkan berlebihan

Prinsip dasar Clean Architecture sebenarnya bagus. Separation of concerns penting. Testability penting. Decoupling juga penting.

Masalahnya, banyak orang menyalin upacaranya, bukan prinsipnya.

Di situlah Go mulai melawan.

- Go suka wiring yang eksplisit.
- Go lebih nyaman dengan package kecil yang tanggung jawabnya jelas.
- Go tidak membutuhkan interface untuk setiap hal yang bergerak.
- Go cepat menjadi sulit dibaca ketika satu konsep dipecah ke banyak layer tanpa alasan kuat.

Saya pernah melihat codebase yang "clean" tapi handler memanggil use case, use case memanggil service, service memanggil repository, semuanya lewat interface yang didefinisikan jauh dari konsumennya. Pada titik itu, kodenya bukan fleksibel. Kodenya cuma tebal.

## Struktur yang paling sering saya pakai

Saya lebih suka susunan yang jujur terhadap cara aplikasi bekerja:

```text
project/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── domain/
│   ├── service/
│   ├── repository/
│   └── transport/
└── go.mod
```

Ini bukan aturan suci. Ini cuma struktur yang jujur.

Domain menyimpan bahasa bisnis. Service mengorkestrasi alur. Repository menangani persistence. Transport menerjemahkan dunia luar ke dalam bentuk yang dimengerti aplikasi. `main.go` merakit semuanya secara terbuka.

Dengan susunan seperti itu, saya mendapat sebagian besar manfaat yang orang cari dari kata "arsitektur" tanpa menimbun codebase dengan seremoni.

## Domain saya sengaja dibuat membosankan

Di kode domain, membosankan adalah pujian.

```go
type User struct {
    ID        string
    Email     string
    Name      string
    CreatedAt time.Time
}

func (u *User) Validate() error {
    if u.Email == "" {
        return ErrInvalidEmail
    }
    if u.Name == "" {
        return ErrInvalidName
    }
    return nil
}
```

Saya tidak butuh constructor rumit, pola yang terlalu canggih, atau aturan tersembunyi hanya untuk merepresentasikan user. Saya butuh bentuk data yang jelas dan validasi yang gampang dipercaya.

## Service adalah tempat keputusan bisnis terlihat

Saya suka memakai service karena aturan aplikasi jadi mudah ditemukan.

```go
type UserService struct {
    repo UserRepository
}

func (s *UserService) CreateUser(ctx context.Context, email, name string) (*domain.User, error) {
    user := &domain.User{
        ID:        generateID(),
        Email:     email,
        Name:      name,
        CreatedAt: time.Now(),
    }

    if err := user.Validate(); err != nil {
        return nil, err
    }

    if existing, _ := s.repo.GetByEmail(ctx, email); existing != nil {
        return nil, domain.ErrUserExists
    }

    return user, s.repo.Create(ctx, user)
}
```

Handler tidak perlu memiliki logika ini. Repository juga tidak. Service adalah tempat yang baik untuk orkestrasi karena aturan bisnis tetap mudah dicari dan mudah diuji.

## Interface saya definisikan di dekat pemakainya

Ini salah satu kebiasaan Go yang paling berguna buat saya.

```go
type UserRepository interface {
    Create(ctx context.Context, user *domain.User) error
    GetByEmail(ctx context.Context, email string) (*domain.User, error)
}
```

Saya tidak membuat package `interfaces` global lalu menyebutnya arsitektur. Kalau service butuh kontrak repository, biasanya kontrak itu sebaiknya hidup dekat service tersebut. Konsumenlah yang mendefinisikan seam-nya.

Pendekatan ini membuat abstraksi tetap rapat dan mencegah codebase berubah menjadi perburuan file.

## Layer transport sebaiknya tetap tipis

HTTP atau gRPC cukup menerjemahkan, bukan ikut berpikir.

```go
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        writeError(w, "invalid JSON", http.StatusBadRequest)
        return
    }

    user, err := h.service.CreateUser(r.Context(), req.Email, req.Name)
    if err != nil {
        handleServiceError(w, err)
        return
    }

    writeJSON(w, user, http.StatusCreated)
}
```

Kalau handler tetap tipis, perubahan di layer transport tidak mudah bocor ke logika bisnis. Proyek juga lebih gampang diperluas kalau nanti perlu gRPC, CLI, atau background job.

## Wiring yang eksplisit justru kelebihan

Saya merakit dependency di `main.go` dengan kode biasa.

```go
func main() {
    db := setupDatabase()

    userRepo := postgres.NewUserRepository(db)
    userService := service.NewUserService(userRepo)
    userHandler := http.NewUserHandler(userService)

    router := setupRoutes(userHandler)
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

Saya ingin bisa melihat bagaimana aplikasi dirakit. Dependency graph yang tersembunyi tidak membuat saya terkesan. Biasanya justru membuat debugging lebih buruk.

## Kenapa struktur ini terus terasa berguna

Nilai utamanya bukan kemurnian arsitektur. Nilai utamanya adalah kecepatan yang tetap aman.

Saya bisa menguji service dengan repository in-memory. Saya bisa menelusuri alur request tanpa membuka terlalu banyak file. Saya bisa menjelaskan susunan proyek ke engineer lain tanpa harus menggambar diagram berlapis-lapis lebih dulu.

Itulah yang seharusnya diberikan struktur yang baik. Bukan gengsi. Bukan poin pola desain. Kejelasan saat tekanan datang.

## Yang sekarang saya hindari

- Generic repository yang mengaburkan bentuk database
- Interface yang dibuat "siapa tahu nanti perlu"
- Layer berlapis dengan nama samar seperti `usecase`, `manager`, atau `processor`
- Indirection yang pintar di permukaan tapi menyembunyikan aturan bisnis sederhana

Kalau sebuah pola tidak membuat engineer berikutnya lebih cepat, besar kemungkinan itu cuma dekorasi.

## Patokan saya sekarang

Go tidak membutuhkan desain yang lebih sedikit. Go membutuhkan desain yang lebih jujur.

Saya tetap peduli pada batas yang jelas, testing, dan maintainability. Saya hanya tidak lagi menganggap banyaknya abstraksi sebagai tanda kedewasaan. Kalau kode mudah dibaca, dirakit dengan jelas, dan cukup lentur saat berubah, biasanya itu sudah lebih dari cukup.

Banyak proyek Go membaik begitu kita berhenti berusaha membuatnya tampak penting, lalu mulai berusaha membuatnya tampak jelas.
