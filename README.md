# CV Builder

SaaS untuk membuat CV profesional. Setiap pengguna punya akun sendiri, bisa menyimpan hingga 10 CV, mengatur urutan isi dengan drag and drop, melihat pratinjau A4 langsung (dua halaman tampil berdampingan), mengekspor PDF, dan membuat versi bahasa Inggris/Indonesia dari CV-nya.

## Fitur

| Fitur | Keterangan |
| --- | --- |
| Akun per pengguna | Daftar/masuk dengan email + kata sandi, dilindungi captcha Cloudflare Turnstile tanpa centang (aktif jika key diisi). Login Google aktif jika `GOOGLE_CLIENT_ID` diisi. Setiap CV hanya bisa dibuka pemiliknya. |
| Banyak CV | Maksimal 10 CV per akun. Buat CV dari template kosong atau salin CV lama. Duplikat, ganti nama, hapus dari dashboard. |
| Edit lengkap | Identitas, kontak & media sosial (WhatsApp, Email, LinkedIn, GitHub, Website, Instagram, X, YouTube, Telepon, lainnya), pendidikan, keterampilan, pengalaman, proyek, prestasi, ringkasan, dan bagian bebas (organisasi, sertifikasi, …). |
| Atur urutan | Seret ikon ⋮⋮ (mouse, sentuh, atau keyboard: Spasi → panah → Spasi) atau tombol ↑ ↓ untuk bagian, item, dan tautan. |
| Sembunyikan tanpa menghapus | Ikon mata pada bagian, item, dan tautan. |
| Pratinjau langsung | Isi dibagi otomatis ke halaman A4. Mode "Berdampingan" menampilkan 2 halaman sejajar; "1 kolom" menumpuk ke bawah. Zoom "Pas layar" atau 50–125%. |
| Atur halaman | Centang "Mulai bagian ini di halaman baru" untuk memaksa pindah halaman. Judul bagian tidak pernah tertinggal sendirian di akhir halaman. |
| Download PDF | PDF dibuat server dari halaman yang sama dengan pratinjau, jadi hasilnya identik. Teks bisa disalin. Nama file otomatis: `CV_<Nama>_<BLNTH>.pdf`. |
| Cetak via browser | Alternatif bila server tidak punya Chrome: buka dialog cetak browser lalu "Simpan sebagai PDF". |
| Versi EN / ID | "Buat versi EN" menyalin CV menjadi CV baru berbahasa Inggris (judul `… (EN)`). Judul bagian otomatis berbahasa Inggris; isi ditulis ulang sendiri oleh pengguna supaya akurat. Salinan dihitung ke batas 10 CV. |
| Simpan otomatis | Perubahan tersimpan 0,8 detik setelah berhenti mengetik. Status "Tersimpan / Menyimpan… / Gagal menyimpan" di kanan atas. |

## Tech stack

| Bagian | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions) + React 19 + TypeScript |
| Styling | Tailwind CSS 4; lembar CV memakai CSS biasa dengan satuan mm (`src/components/cv/cv-sheet.css`) |
| Database | PostgreSQL + Prisma 6. Isi CV disimpan sebagai satu dokumen JSON per CV, divalidasi Zod. |
| Auth | Better Auth (sesi cookie, email/password, Google opsional) |
| Drag and drop | @dnd-kit |
| PDF | puppeteer-core + Chrome/Chromium yang terpasang di server; di Vercel/AWS Lambda memakai `@sparticuz/chromium` |
| Captcha | Cloudflare Turnstile (mode invisible) lewat plugin `captcha` Better Auth |
| Tes | Vitest |

## Menjalankan secara lokal

Butuh Node.js 20+, pnpm, PostgreSQL, dan Google Chrome (untuk PDF).

```bash
pnpm install
cp .env.example .env            # lalu isi DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET
createdb cv_builder
pnpm db:migrate                 # buat tabel
pnpm db:seed                    # opsional: akun demo dengan CV contoh
pnpm dev
```

Buka http://localhost:3000. Akun demo dari seed: `demo@cvbuilder.local` / `demo12345`.

`BETTER_AUTH_URL` harus sama persis dengan alamat yang dibuka di browser (termasuk port), karena dipakai untuk cek origin login dan untuk membuka halaman cetak saat membuat PDF.

### Variabel lingkungan

| Nama | Wajib | Fungsi |
| --- | --- | --- |
| `DATABASE_URL` | ya | Koneksi PostgreSQL yang dipakai aplikasi (di Vercel: URL pooler) |
| `DIRECT_URL` | ya | Koneksi langsung untuk `prisma migrate`. Lokal: sama dengan `DATABASE_URL` |
| `BETTER_AUTH_SECRET` | ya | Kunci sesi. Buat dengan `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ya | URL publik aplikasi |
| `NEXT_PUBLIC_APP_URL` | ya | Sama dengan `BETTER_AUTH_URL` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | tidak | Aktifkan login Google |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | tidak | Captcha tanpa centang di daftar, masuk, dan reset kata sandi. Kosongkan untuk mematikan. |
| `CHROME_EXECUTABLE_PATH` | tidak | Lokasi Chrome bila tidak terdeteksi otomatis. Di Vercel kosongkan. |
| `PDF_RENDER_ORIGIN` | tidak | Origin yang dibuka Chrome untuk PDF (default `BETTER_AUTH_URL`) |
| `TEST_DATABASE_URL` | untuk tes | Database terpisah untuk `pnpm test` |

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `pnpm dev` | Server pengembangan |
| `pnpm build` / `pnpm start` | Build dan jalankan produksi |
| `pnpm test` | Unit test (+ tes kepemilikan data jika `TEST_DATABASE_URL` diisi) |
| `pnpm typecheck` | Cek tipe TypeScript |
| `pnpm db:migrate` | Buat/terapkan migrasi saat pengembangan |
| `pnpm db:deploy` | Terapkan migrasi di produksi |
| `pnpm vercel-build` | Dipakai otomatis oleh Vercel: `prisma generate`, `prisma migrate deploy`, lalu `next build` |
| `pnpm db:seed` | Isi akun demo |

## Cara pakai

1. **Daftar** di `/register`, lalu Anda masuk ke **CV saya**.
2. Klik **+ CV baru**. Isi nama CV (mis. "AI Engineer — Gojek"), pilih **Mulai dari**: CV kosong atau salin CV yang sudah ada, dan pilih bahasa CV.
3. Di editor:
   - Isi **Identitas** dan **Kontak & media sosial**. Ganti jenis tautan lewat dropdown, tambah dengan "+ Tambah tautan".
   - Setiap **bagian** bisa diganti judulnya (kosongkan untuk judul bawaan sesuai bahasa), disembunyikan, dihapus, atau dipindah.
   - Klik judul item pengalaman/proyek untuk membuka isinya. Tulis satu poin per baris pada kolom pencapaian.
   - Tambah bagian baru di bawah, mis. "Bagian Lain" untuk organisasi atau sertifikasi.
   - Klik kolom mana pun: blok terkait disorot di pratinjau.
4. Atur tampilan pratinjau: **Berdampingan** untuk melihat 2 halaman sekaligus. Jika muncul "ada isi yang terpotong", satu item lebih panjang dari satu halaman; pendekkan poinnya.
5. **Download PDF** untuk file siap kirim. Jika gagal (server tanpa Chrome), pakai **Cetak via browser**.
6. **Buat versi EN** membuat salinan berbahasa Inggris dan langsung membukanya. Judul bagian sudah dalam bahasa Inggris; tulis ulang isi tiap kolom dalam bahasa Inggris.

## Arsitektur singkat

```
src/
  app/                    halaman (landing, auth, dashboard, editor, print) + API (auth, pdf)
  actions/resume.ts       server actions: buat, simpan, salin, ganti nama, hapus, buat versi bahasa lain
  lib/resume/             schema Zod, default, tautan, blok, paginasi, salinan bahasa, repository (batas 10 CV)
  lib/pdf/                Chrome headless + nama file
  components/cv/          render lembar A4 (dipakai pratinjau, cetak, dan PDF)
  components/editor/      panel editor, drag and drop, autosave
```

- **Pratinjau = PDF.** `PaginatedCv` mengukur setiap blok di kolom tersembunyi, lalu `paginate()` membagi blok ke halaman A4 (konten 174 × 265 mm). Halaman `/cv/[id]/print` memakai komponen yang sama; Chrome headless menunggu `data-ready="true"` lalu mencetak.
- **Keamanan.** Semua query memfilter `userId` dari sesi server; CV milik orang lain menghasilkan 404. Tautan hanya boleh `http(s)`, `mailto`, `tel`. Saat membuat PDF, Chrome hanya boleh memuat origin aplikasi sendiri, dan ekspor dibatasi 10 per menit per pengguna.
- Desain lengkap: [`docs/superpowers/specs/2026-10-10-cv-builder-saas-design.md`](docs/superpowers/specs/2026-10-10-cv-builder-saas-design.md).

## Deploy

**Docker** (app + Chromium + PostgreSQL):

```bash
export BETTER_AUTH_SECRET=$(openssl rand -base64 32)
docker compose up --build
```

**VPS / Node biasa:** pasang Chromium (`apt install chromium`), set variabel lingkungan, lalu `pnpm install && pnpm build && pnpm db:deploy && pnpm start`.

**Vercel + Supabase:**

1. Buat project di Supabase. Buka **Connect** dan salin dua URL:
   - **Transaction pooler** (port 6543) untuk `DATABASE_URL`. Tambahkan `?pgbouncer=true&connection_limit=1` di akhir.
   - **Session pooler** atau **Direct connection** (port 5432) untuk `DIRECT_URL`.
2. Import repo di Vercel (framework Next.js terdeteksi otomatis).
3. Di **Settings → Environment Variables**, isi `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, serta `BETTER_AUTH_URL` dan `NEXT_PUBLIC_APP_URL` dengan domain produksi (mis. `https://cv.example.com`).
4. Di **Settings → Build and Deployment**, tambahkan env `ENABLE_EXPERIMENTAL_COREPACK=1` supaya Vercel memakai pnpm versi di `packageManager`. Node.js minimal 22 (default Vercel 24).
5. Deploy. Script `vercel-build` menjalankan migrasi database sebelum build, jadi tabel otomatis dibuat dan diperbarui.

Catatan:

- **Download PDF** memakai Chromium dari `@sparticuz/chromium` (sekitar 67 MB, dibuka ke `/tmp` saat pertama dipakai). Permintaan PDF pertama setelah fungsi "dingin" butuh beberapa detik lebih lama.
- Chrome di server membuka halaman cetak lewat `BETTER_AUTH_URL`. Jika **Deployment Protection** aktif di URL itu, Chrome mendapat 401 dan PDF gagal. Pakai domain produksi (tidak diproteksi secara default), atau isi `PDF_RENDER_ORIGIN`.
- Preview deployment juga menjalankan migrasi. Jika env Preview memakai database produksi, migrasi dari branch ikut ke produksi. Pakai database terpisah untuk Preview.
- Rate limit PDF disimpan di memori tiap instance. Dengan banyak instance, batas efektifnya lebih longgar; ganti dengan Redis bila perlu.
