/**
 * Seeds a demo account with three example CVs. Every person, company, and project here is
 * fictional. Run: pnpm db:seed
 * Login: demo@cvbuilder.local / demo12345
 */
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/db";
import { newId } from "../src/lib/resume/ids";
import { createResume } from "../src/lib/resume/repository";
import type { Item, ResumeContent, Section, SectionType } from "../src/lib/resume/schema";

const DEMO_EMAIL = "demo@cvbuilder.local";
const DEMO_PASSWORD = "demo12345";
const DEMO_NAME = "Budi Santoso";

const item = (fields: Partial<Item>): Item => ({ id: newId(), title: "", subtitle: "", date: "", detail: "", bullets: "", visible: true, ...fields });
const section = (type: SectionType, items: Item[], pageBreakBefore = false): Section => ({ id: newId(), type, title: "", visible: true, pageBreakBefore, items });
const lines = (value: string) => value.split("\n").map(line => line.trim()).filter(Boolean);
const bullets = (...points: string[]) => points.join("\n");

const links = (): ResumeContent["links"] => [
  { id: newId(), type: "whatsapp", value: "+6281234567890", visible: true },
  { id: newId(), type: "email", value: "budi.santoso@example.com", visible: true },
  { id: newId(), type: "linkedin", value: "linkedin.com/in/budisantoso", visible: true },
  { id: newId(), type: "github", value: "github.com/budisantoso", visible: true },
];

const education = () =>
  section("education", [
    item({ title: "S1 Teknik Informatika, Institut Teknologi Contoh", date: "2020 — 2024", detail: "IPK 3,65/4,00" }),
    item({ title: "SMA Negeri 1 Contoh", date: "2017 — 2020" }),
  ]);

const cv = (sections: Section[]): ResumeContent => ({ schemaVersion: 1, personal: { fullName: DEMO_NAME, headline: "" }, links: links(), sections });

const AI_ENGINEER = cv([
  section("summary", [
    item({
      detail:
        "AI Engineer dengan pengalaman membangun aplikasi Generative AI, pipeline RAG, dan model computer vision dari tahap riset hingga produksi.",
    }),
  ]),
  education(),
  section("skills", [
    item({ title: "Programming", detail: "Python, TypeScript, SQL, Bash" }),
    item({ title: "Generative AI & LLM", detail: "OpenAI API, Gemini API, LangChain, Prompt Engineering" }),
    item({ title: "RAG & Vector Search", detail: "ChromaDB, FAISS, pgvector, Embeddings" }),
    item({ title: "Machine Learning", detail: "PyTorch, TensorFlow, YOLO, OpenCV, Scikit-learn" }),
    item({ title: "Deployment", detail: "Docker, FastAPI, Redis, Linux, Git" }),
  ]),
  section("experience", [
    item({
      title: "AI Engineer",
      date: "Januari 2025 — Saat Ini",
      subtitle: "PT Data Cerdas Contoh",
      bullets: bullets(
        "Membangun asisten tanya-jawab internal berbasis RAG untuk 2.000+ dokumen kebijakan perusahaan.",
        "Menurunkan biaya pemanggilan LLM sekitar 40% dengan semantic cache dan pemilihan model per jenis pertanyaan.",
        "Menyusun evaluasi otomatis untuk mengukur akurasi jawaban sebelum setiap rilis.",
      ),
    }),
    item({
      title: "Machine Learning Intern",
      date: "Juli 2023 — Desember 2023",
      subtitle: "Startup Visi Contoh | Internship",
      bullets: bullets(
        "Melatih model object detection untuk menghitung produk di rak toko dengan mAP 0,87.",
        "Mengoptimalkan model agar berjalan real-time di perangkat edge.",
      ),
    }),
  ]),
  section(
    "projects",
    [
      item({
        title: "Asisten Dokumen Hukum",
        detail: "Python, FastAPI, LangChain, pgvector, OpenAI API",
        bullets: bullets(
          "Mengembangkan chatbot yang menjawab pertanyaan dari dokumen hukum beserta kutipan pasal sumbernya.",
          "Menerapkan hybrid search (BM25 + vector) untuk meningkatkan relevansi hasil pencarian.",
        ),
      }),
      item({
        title: "Klasifikasi Tiket Layanan Pelanggan",
        detail: "Python, Scikit-learn, FAISS, Pandas",
        bullets: bullets(
          "Mengklasifikasikan tiket ke 12 kategori dengan retrieval contoh tiket historis.",
          "Mengekspor hasil klasifikasi ke Excel untuk tim operasional.",
        ),
      }),
      item({
        title: "Deteksi Kematangan Buah",
        detail: "Python, YOLO, Raspberry Pi, OpenCV",
        bullets: bullets(
          "Membuat sistem deteksi kematangan buah secara real-time untuk otomasi panen.",
          "Melakukan training, evaluasi, dan deployment model pada perangkat edge.",
        ),
      }),
    ],
    true,
  ),
  section("achievements", lines("Juara 2 Hackathon AI Nasional Contoh 2024\nFinalis Kompetisi Data Science Contoh 2023").map(title => item({ title }))),
]);

const WEB_DEVELOPER = cv([
  education(),
  section("skills", [
    item({ title: "Frontend", detail: "React, Next.js, TypeScript, Tailwind CSS" }),
    item({ title: "Backend", detail: "Node.js, NestJS, REST API, PostgreSQL, Prisma" }),
    item({ title: "Tools", detail: "Git, Docker, Figma, Vercel" }),
  ]),
  section("experience", [
    item({
      title: "Frontend Developer",
      date: "Maret 2024 — Saat Ini",
      subtitle: "PT Toko Daring Contoh",
      bullets: bullets(
        "Membangun ulang halaman checkout dengan Next.js sehingga waktu muat turun dari 4,1 detik menjadi 1,6 detik.",
        "Menyusun design system berisi 40+ komponen yang dipakai tiga tim produk.",
      ),
    }),
    item({
      title: "Web Developer",
      date: "Agustus 2022 — Februari 2024",
      subtitle: "Freelance",
      bullets: bullets("Membuat 15+ website company profile dan toko online untuk UMKM.", "Mengelola deployment, domain, dan perawatan website klien."),
    }),
  ]),
  section("projects", [
    item({
      title: "Aplikasi Reservasi Klinik",
      detail: "Next.js, NestJS, PostgreSQL",
      bullets: bullets("Membuat sistem antrean dan reservasi online untuk klinik dengan notifikasi WhatsApp.", "Dipakai oleh 3 cabang klinik dengan 500+ reservasi per bulan."),
    }),
    item({
      title: "Dashboard Penjualan",
      detail: "React, Chart.js, Node.js",
      bullets: bullets("Menampilkan ringkasan penjualan harian dan stok barang secara real-time."),
    }),
  ]),
  section("achievements", lines("Sertifikasi Front-End Web Developer Contoh 2023").map(title => item({ title }))),
]);

const FULL_STACK = cv([
  education(),
  section("skills", [
    item({ title: "Bahasa", detail: "TypeScript, JavaScript, Python, Go" }),
    item({ title: "Framework", detail: "Next.js, NestJS, Express, FastAPI" }),
    item({ title: "Data & Infrastruktur", detail: "PostgreSQL, Redis, Docker, GitHub Actions" }),
  ]),
  section("experience", [
    item({
      title: "Full-stack Developer",
      date: "Juni 2023 — Saat Ini",
      subtitle: "PT Logistik Contoh",
      bullets: bullets(
        "Mengembangkan aplikasi pelacakan pengiriman untuk 20.000+ paket per hari.",
        "Merancang API dan skema database untuk modul penagihan pelanggan.",
        "Menyiapkan CI/CD sehingga rilis bisa dilakukan beberapa kali sehari.",
      ),
    }),
  ]),
  section("projects", [
    item({
      title: "Platform Kursus Online",
      detail: "Next.js, NestJS, PostgreSQL, Redis",
      bullets: bullets("Membangun platform kursus dengan video, kuis, dan sertifikat otomatis.", "Menangani pembayaran dan langganan bulanan."),
    }),
    item({
      title: "Bot Pengingat Tagihan",
      detail: "Node.js, WhatsApp API, PostgreSQL",
      bullets: bullets("Mengirim pengingat tagihan otomatis ke pelanggan sesuai jadwal jatuh tempo."),
    }),
  ]),
  section("achievements", lines("Juara 1 Lomba Web Development Contoh 2022").map(title => item({ title }))),
]);

async function main() {
  let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    await auth.api.signUpEmail({ body: { email: DEMO_EMAIL, password: DEMO_PASSWORD, name: DEMO_NAME } });
    user = await prisma.user.findUniqueOrThrow({ where: { email: DEMO_EMAIL } });
  }
  await prisma.resume.deleteMany({ where: { userId: user.id } });

  const cvs: [string, ResumeContent][] = [
    ["AI Engineer — Contoh", AI_ENGINEER],
    ["Web Developer — Contoh", WEB_DEVELOPER],
    ["Full-stack Developer — Contoh", FULL_STACK],
  ];
  for (const [title, content] of cvs.reverse()) {
    await createResume(user.id, { title, language: "id", content });
  }
  console.log(`Seeded ${cvs.length} CVs for ${DEMO_EMAIL} (password: ${DEMO_PASSWORD})`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
