---
title: Cara Saya Menjaga Kode Go Tetap Bersih (Tanpa Jadi Gila) 🧹
publishedAt: 2025-02-15
description: Pelajari cara menyusun aplikasi Go dengan prinsip clean architecture yang benar-benar berfungsi. Temukan mengapa Clean Architecture murni tidak cocok untuk Go, dan dapatkan pendekatan praktis menggunakan services dan repositories yang menjaga kode tetap mudah dipelihara tanpa over-engineering. Termasuk contoh kode nyata dan strategi testing.
tags: ['go', 'design patterns', 'clean architecture']
keywords: 'golang architecture, go clean code, golang project structure, go services pattern, golang repositories, go best practices, golang testing, go code organization, clean architecture go, golang design patterns'
readTime: 9
lang: id
---

Oke, mari jujur sebentar. Dulu saya adalah developer _itu_ yang mencoba memaksakan pola Clean Architecture ke setiap project Go. Spoiler alert: berantakan banget. 😅

Setelah membangun terlalu banyak API yang over-engineered dan mendapat pandangan aneh dari rekan kerja, akhirnya saya menemukan cara menulis kode Go yang benar-benar bersih DAN terasa natural. Inilah yang saya pelajari tentang menyusun aplikasi Go tanpa kehilangan kewarasan.

## Mengapa Clean Architecture Terasa Aneh di Go 🤔

Intinya begini: Clean Architecture dari Uncle Bob itu keren, tapi dirancang untuk developer Java/C# yang suka abstract factory dan dependency injection container mereka. Go? Tidak terlalu.

**Go suka yang datar** 🏔 - Semua lapisan kaku dan circular dependencies itu membuat developer Go menangis. Kami lebih suka komponen yang sederhana dan dapat disusun.

**Interface di mana-mana = berlebihan** 🎭 - Interface implisit Go itu ajaib, tapi Clean Architecture ingin kita membuat interface untuk segalanya. Kadang-kadang fungsi sederhana lebih baik daripada interface dengan satu method!

**Error handling bentrok** ⚠️ - Return error eksplisit Go tidak cocok dengan pola heavy exception yang sering terlihat di contoh Clean Architecture.

**Konflik package** 📦 - Sistem package Go sudah memberikan organisasi yang bagus. Menambah lapisan lagi di atasnya bisa membuat hal-hal jadi membingungkan daripada lebih jelas.

Tapi hey! _Ide-ide_ di balik Clean Architecture—menjaga pemisahan, membuat kode dapat ditest, tidak menggabungkan semuanya—itu emas di Go juga. ✨

## Struktur Go "Cukup Bagus" Saya 🗗️

Setelah mencoba setiap pola di bawah matahari, inilah yang benar-benar berfungsi untuk saya:

```
project/
├── cmd/
│   └── server/
│       └── main.go          # 🎯 Entry point
├── internal/
│   ├── domain/              # 📋 Business stuff kamu
│   │   ├── user.go
│   │   └── errors.go
│   ├── service/             # 🔧 Business logic tinggal di sini
│   │   └── user.go
│   ├── repository/          # 💾 Data access
│   │   ├── postgres/
│   │   └── memory/
│   └── transport/           # 🌐 HTTP/gRPC/CLI stuff
│       ├── http/
│       └── grpc/
├── pkg/                     # 📦 Bagian yang dapat digunakan ulang
└── go.mod
```

Rahasia sausnya? **Services daripada "use cases"** dan membiarkan package Go melakukan pekerjaan berat. Jauh lebih sedikit upacara, jauh lebih jelas! 🎉

## Domain Layer: Tetap Sederhana Banget 🧠

Domain kamu adalah tempat bisnis penting tinggal, tapi saya membuatnya ringan. Tidak ada konstruktor fancy atau validasi kompleks—hanya yang esensial:

```go
type User struct {
    ID        string    `json:"id"`
    Email     string    `json:"email"`
    Name      string    `json:"name"`
    CreatedAt time.Time `json:"created_at"`
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

Lihat? Tidak ada sihir, tidak ada pola konstruktor aneh. Hanya struct dan method validasi sederhana. Zero values Go sudah mendukung kita! 💪

## Services: Di Mana Keajaiban Terjadi ✨

Daripada "use cases" yang membingungkan, saya hanya menyebutnya services. Mereka pada dasarnya struct dengan method yang melakukan hal-hal—sangat Go-like!

```go
type UserService struct {
    repo   UserRepository
    logger *slog.Logger
}

func (s *UserService) CreateUser(ctx context.Context, email, name string) (*domain.User, error) {
    user := &domain.User{
        ID:        generateID(), // fungsi UUID tertentu
        Email:     email,
        Name:      name,
        CreatedAt: time.Now(),
    }

    if err := user.Validate(); err != nil {
        return nil, err // tidak, coba lagi
    }

    // Periksa apakah user sudah ada (tidak ada yang suka duplikat)
    if existing, _ := s.repo.GetByEmail(ctx, email); existing != nil {
        return nil, domain.ErrUserExists
    }

    return user, s.repo.Create(ctx, user)
}
```

Di sinilah business logic kamu tinggal. Ini mengatur semuanya tapi tidak terjebak dalam upacara arsitektur. Sederhana! 🎯

## Repositories: Abstraksi Yang Benar-Benar Masuk Akal 💾

Di sini saya mendefinisikan interface data saya. Saya menempatkannya langsung di package service karena di situlah mereka benar-benar digunakan:

```go
// Definisikan interface di mana kamu menggunakannya, bukan di lapisan abstrak
type UserRepository interface {
    Create(ctx context.Context, user *domain.User) error
    GetByEmail(ctx context.Context, email string) (*domain.User, error)
    // Hanya method yang benar-benar kamu butuhkan!
}
```

Lalu implementasikan di mana pun masuk akal:

```go
// Implementasi PostgreSQL
type UserRepository struct {
    db *sql.DB
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
    query := `INSERT INTO users (id, email, name, created_at) VALUES ($1, $2, $3, $4)`
    _, err := r.db.ExecContext(ctx, query, user.ID, user.Email, user.Name, user.CreatedAt)
    return err
}
```

Untuk testing, saya melewati mock sepenuhnya dan menggunakan versi in-memory. Jauh lebih mudah untuk dipahami! 🧠

```go
// Implementasi Memory untuk testing
type UserRepository struct {
    users map[string]*domain.User
    mu    sync.RWMutex
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
    r.mu.Lock()
    defer r.mu.Unlock()
    r.users[user.ID] = user
    return nil
}
```

## Transport Layer: Jaga Handler Tetap Kurus 🚚

Handler HTTP kamu (atau gRPC, atau CLI) harus super tipis. Mereka hanya menerjemahkan antara dunia luar dan services kamu:

```go
type UserHandler struct {
    service *service.UserService
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        writeError(w, "invalid JSON", http.StatusBadRequest)
        return
    }

    user, err := h.service.CreateUser(r.Context(), req.Email, req.Name)
    if err != nil {
        handleServiceError(w, err) // konversi service error ke HTTP error
        return
    }

    writeJSON(w, user, http.StatusCreated) // sukses! 🎉
}
```

Lihat seberapa tipis itu? Handler hanya menangani hal-hal HTTP, service menangani hal-hal bisnis. Pemisahan yang bersih! ✨

## Menghubungkan Semuanya: Tidak Ada Sihir, Hanya Fungsi 🔌

Lupakan framework dependency injection yang kompleks. Gunakan saja fungsi dan hubungkan semuanya di `main.go`:

```go
func main() {
    db := setupDatabase()      // koneksi ke postgres
    logger := setupLogger()    // setup structured logging

    // Hubungkan dependency (tidak ada sihir!)
    userRepo := postgres.NewUserRepository(db)
    userService := service.NewUserService(userRepo, logger)
    userHandler := http.NewUserHandler(userService)

    router := setupRoutes(userHandler)
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

Eksplisit, mudah diikuti, dan tidak ada framework untuk dipelajari. Ini adalah cara Go! 🚀

## Testing: Di Mana Ini Benar-Benar Bersinar ✅

Jujur? Inilah mengapa saya menyusun kode saya dengan cara ini. Testing menjadi sangat mudah:

```go
func TestUserService_CreateUser(t *testing.T) {
    // Tidak perlu framework mocking!
    repo := memory.NewUserRepository()
    logger := slog.New(slog.NewTextHandler(io.Discard, nil))
    service := service.NewUserService(repo, logger)

    user, err := service.CreateUser(context.Background(), "test@example.com", "John")

    assert.NoError(t, err)
    assert.Equal(t, "test@example.com", user.Email)
    // Test lulus! 🎉
}
```

Tidak ada mocking kompleks, tidak ada test setup yang rapuh. Hanya tukar dengan implementasi memory dan kamu siap. Diri masa depan kamu akan berterima kasih! 😊

## Kapan Pendekatan Ini Paling Berhasil

Struktur ini unggul dalam beberapa skenario:

**Aplikasi Berukuran Sedang**: Lebih dari API CRUD sederhana tetapi bukan sistem enterprise yang masif. Pikirkan 5-50 endpoint dengan business logic yang bermakna.

**Project Tim**: Beberapa developer dapat bekerja tanpa saling menginjak kaki. Batas yang jelas antara lapisan transport, service, dan repository.

**Requirement yang Berkembang**: Business logic sering berubah, tetapi entitas inti tetap stabil. Lapisan service beradaptasi tanpa menyentuh kode transport atau repository.

**Multiple Interface**: Perlu REST API dan CLI? Atau REST dan gRPC? Implementasi transport yang berbeda berbagi lapisan service yang sama.

## Apa Yang Saya Hindari

**Over-Abstraction**: Jika sepotong kode hanya memiliki satu implementasi dan tidak mungkin berubah, saya tidak mengabstraksinya. Interface di Go harus mewakili perilaku, bukan hanya untuk memungkinkan testing.

**Hierarki Inheritance Dalam**: Go tidak memiliki inheritance, dan itu adalah fitur. Saya menyusun perilaku daripada mencoba menciptakan kembali pola OOP.

**Repository Generik**: Interface repository spesifik untuk domain mereka. Tidak ada tipe generik `Repository<T>`—mereka menyembunyikan konsep domain yang penting.

**Layered Packages**: Saya tidak membuat package terpisah untuk "interface" atau "abstraksi". Interface tinggal dengan konsumen mereka.

## Mengapa Ini Mengalahkan Clean Architecture "Murni" di Go 🥊

Pendekatan saya berbeda dari Clean Architecture textbook dalam beberapa cara utama:

**Batas fleksibel** 🚪 - Daripada lapisan kaku yang tidak pernah bisa berbicara satu sama lain, saya memiliki kelompok logis yang dapat berkomunikasi ketika masuk akal.

**Interface di tempat yang tepat** 🏠 - Interface tinggal dengan kode yang menggunakannya, bukan di "lapisan interface" abstrak.

**Error handling gaya Go** ⚠️ - Return error eksplisit mengalir secara alami melalui lapisan. Tidak ada abstraksi exception aneh!

**Sederhana mengalahkan murni** ✨ - Ketika idiom Go bertentangan dengan teori arsitektur, saya memilih cara Go setiap saat.

## Performa? Jangan Khawatir 🚀

Struktur ini pada dasarnya memiliki overhead performa nol:

- **Tidak ada runtime reflection** - Fungsi konstruktor sederhana = zero runtime cost
- **Biaya interface kecil** - Interface dispatch Go super cepat, dan biasanya dapat diabaikan dibandingkan dengan panggilan database
- **Fewer allocations** - Service berbasis struct mengalahkan pendekatan fungsional yang heavy closure

## Refactoring Kode Yang Ada? Pelan-Pelan Saja 🐌

Ketika memperbaiki kode spaghetti yang ada:

1. **Mulai dengan repository** - Ekstrak hal-hal database terlebih dahulu
2. **Kelompokkan business logic** - Pindahkan fungsi terkait ke dalam struct service
3. **Tipiskan handler kamu** - Hanya simpan concern HTTP di handler HTTP
4. **Tambahkan interface terakhir** - Hanya ketika kamu benar-benar perlu menukar implementasi

Jangan coba memperbaiki semuanya sekaligus. Go compile cepat, jadi perubahan incremental tidak menyakitkan! 😌

## Kesimpulan 🎬

Lihat, tidak ada framework yang sempurna. React Native membawa kamu ke sana dengan cepat tetapi dengan beberapa trade-off performa. Native memberikan segalanya tetapi biayanya lebih banyak waktu dan uang. KMP adalah anak baru yang mencoba memecahkan trade-off, dan semakin baik dalam melakukannya.

Saran saya? Mulai dengan apa yang tim kamu ketahui, tetapi terus belajar. Landscape pengembangan mobile berkembang pesat, dan developer terbaik adalah mereka yang dapat beradaptasi.

Dengan menggunakan services daripada use cases, menjaga interface tetap sederhana, dan membiarkan sistem package Go melakukan apa yang terbaik dilakukannya, kamu mendapatkan aplikasi yang:

- Mudah dipahami 🧠
- Sederhana untuk ditest ✅
- Benar-benar menyenangkan untuk dikerjakan 🎉

Tujuannya bukan kesempurnaan arsitektur—ini tentang membangun perangkat lunak yang kamu dan tim kamu dapat kirim dengan percaya diri. Pendekatan ini telah bekerja dengan baik untuk saya di banyak project Go, dari API kecil hingga microservice yang kompleks.

Mulai sederhana, refactor ketika hal-hal sakit, dan selalu pilih kejelasan daripada kepintaran. Kode kamu harus menceritakan sebuah cerita, bukan memecahkan teka-teki! 📖

---

_Punya pengalaman mencoba pola berbeda di Go? Apa yang berhasil untuk tim kamu? Tinggalkan komentar di bawah—saya ingin mendengar cerita perang dan kemenangan kamu! 💭_
