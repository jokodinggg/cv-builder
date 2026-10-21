/**
 * Seeds a demo account with the September 2026 LLM CV, plus the profiles from the old
 * static builder when a local (untracked) legacy/ folder exists. Run: pnpm db:seed
 * Login: demo@cvbuilder.local / demo12345
 */
import { existsSync, readFileSync } from "node:fs";
import vm from "node:vm";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/db";
import { newId } from "../src/lib/resume/ids";
import { createResume } from "../src/lib/resume/repository";
import type { Item, ResumeContent, Section, SectionType } from "../src/lib/resume/schema";

const DEMO_EMAIL = "demo@cvbuilder.local";
const DEMO_PASSWORD = "demo12345";

type LegacyProfile = {
  form: { achievements: string; education: string };
  experiences: { title: string; date: string; company: string; bullets: string }[];
  projects: { title: string; tech: string; bullets: string }[];
  skills: { category: string; details: string }[];
};

const item = (fields: Partial<Item>): Item => ({ id: newId(), title: "", subtitle: "", date: "", detail: "", bullets: "", visible: true, ...fields });
const section = (type: SectionType, items: Item[], pageBreakBefore = false): Section => ({ id: newId(), type, title: "", visible: true, pageBreakBefore, items });
const lines = (value: string) => value.split("\n").map(line => line.trim()).filter(Boolean);

const LINKS: ResumeContent["links"] = [
  { id: newId(), type: "whatsapp", value: "+6281234567890", visible: true },
  { id: newId(), type: "email", value: "budi.santoso@example.com", visible: true },
  { id: newId(), type: "linkedin", value: "linkedin.com/in/budisantoso", visible: true },
  { id: newId(), type: "github", value: "github.com/budisantoso", visible: true },
];

function educationItems(text: string): Item[] {
  return lines(text).map(line => {
    const [title, date = "", detail = ""] = line.split("|").map(part => part.trim());
    return item({ title, date, detail });
  });
}

function fromLegacy(profile: LegacyProfile): ResumeContent {
  return {
    schemaVersion: 1,
    personal: { fullName: "Budi Santoso", headline: "" },
    links: LINKS.map(link => ({ ...link, id: newId() })),
    sections: [
      section("skills", profile.skills.map(skill => item({ title: skill.category, detail: skill.details }))),
      section("experience", profile.experiences.map(exp => item({ title: exp.title, date: exp.date, subtitle: exp.company, bullets: exp.bullets }))),
      section("projects", profile.projects.map(project => item({ title: project.title, detail: project.tech, bullets: project.bullets })), true),
      section("achievements", lines(profile.form.achievements).map(title => item({ title }))),
      section("education", educationItems(profile.form.education)),
    ],
  };
}

const LEGACY_SCRIPT = new URL("../legacy/script.js", import.meta.url);

function loadLegacyProfiles(): Record<string, LegacyProfile> | null {
  if (!existsSync(LEGACY_SCRIPT)) return null;
  const source = readFileSync(LEGACY_SCRIPT, "utf8");
  const data = source.slice(source.indexOf("const AI_ENGINEER_PROFILE"), source.indexOf("let profiles"));
  const context: Record<string, unknown> = {};
  vm.runInNewContext(`${data}\nthis.result = { ai: AI_ENGINEER_PROFILE, web: WEB_DEVELOPER_PROFILE, full: FULL_STACK_DEVELOPER_PROFILE };`, context);
  return context.result as Record<string, LegacyProfile>;
}

const LLM_CV: ResumeContent = {
  schemaVersion: 1,
  personal: { fullName: "Budi Santoso", headline: "" },
  links: LINKS,
  sections: [
    section("education", educationItems("S1 Teknologi Informasi, Institut Teknologi Sepuluh Nopember | 2022 — 2026 | IPK 3,74/4,00\nSMA Negeri 5 Semarang | 2018 — 2021 |")),
    section("skills", [
      item({ title: "Programming", detail: "Python, JavaScript, TypeScript, C/C++, Bash" }),
      item({ title: "Generative AI & LLM", detail: "Gemini API, Groq API, OpenAI API, AI Application Integration, Prompt Engineering" }),
      item({ title: "RAG & Information Retrieval", detail: "LangChain, ChromaDB, FAISS, OpenAI Embeddings, Vector Search, Semantic Retrieval" }),
      item({ title: "AI & Machine Learning", detail: "YOLOv11, MobileNet, TensorFlow, OpenCV, Scikit-learn, NumPy, Pandas" }),
      item({ title: "Backend & Data", detail: "NestJS, Next.js, REST API, PostgreSQL, MySQL, SQLite, Prisma" }),
      item({ title: "Systems & Deployment", detail: "Linux, Docker, Redis, Bull Queue, Git" }),
    ]),
    section("experience", [
      item({
        title: "Researcher",
        date: "Maret 2024 — Februari 2025",
        subtitle: "Avalon AI Group (PT. Automasi Visi Analitika Optima) | Internship",
        bullets:
          "Melakukan riset mendalam mengenai Large Language Models (LLM) dan Computer Vision untuk mengembangkan kapabilitas AI.\nBerkolaborasi dengan tim lintas fungsi untuk mengintegrasikan hasil riset ke dalam aplikasi praktis.\nMengikuti perkembangan teknologi dan tren AI terbaru untuk meningkatkan metodologi penelitian.",
      }),
      item({
        title: "Full-stack Developer & AI Engineer",
        date: "November 2025 — Saat Ini",
        subtitle: "Freelance",
        bullets:
          "Mengerjakan proyek berbasis kebutuhan klien yang mencakup Generative AI, machine learning, computer vision, web application, IoT, dan integrasi API.\nMengembangkan solusi dari analisis kebutuhan, implementasi, integrasi layanan AI, pengujian, hingga deployment untuk kebutuhan individu dan bisnis.",
      }),
    ]),
    section(
      "projects",
      [
        item({
          title: "AI Generation Platform",
          detail: "NestJS, Next.js 14, TypeScript, PostgreSQL, Prisma, Redis, Bull Queue, Gemini API, Cloudinary, Docker",
          bullets:
            "Mengembangkan platform Generative AI full-stack untuk text-to-image, image-to-image, image-to-video, dan text-to-speech menggunakan Gemini API.\nMembangun backend berbasis NestJS dengan PostgreSQL, Prisma, Redis, dan Bull Queue untuk mengelola proses generasi AI secara asynchronous.\nMengimplementasikan autentikasi JWT, bcrypt, sistem credits, generation history, rate limiting, serta integrasi Cloudinary untuk penyimpanan hasil generasi.",
        }),
        item({
          title: "CareerAI RAG Assistant",
          detail: "Python, Flask, LangChain, OpenAI Embeddings, ChromaDB",
          bullets:
            "Mengembangkan aplikasi career assistant yang menggunakan Retrieval-Augmented Generation untuk menghasilkan jawaban berbasis knowledge base karier dan skill matching.\nMembangun pipeline indexing dengan OpenAI embeddings dan persistent ChromaDB vector store, termasuk history-aware query rewriting dan retrieval context yang relevan.\nMenggunakan prompt terarah untuk menjaga jawaban LLM tetap grounded pada konteks yang tersedia.",
        }),
        item({
          title: "RAG Ticket Classifier",
          detail: "Python, Flask, OpenAI Embeddings, FAISS, NumPy, Pandas",
          bullets:
            "Mengembangkan aplikasi klasifikasi tiket IT dari file Excel dengan retrieval contoh tiket historis menggunakan FAISS dan OpenAI embeddings.\nMembangun semantic cache dan deduplikasi vector entry berbasis normalized-text hash untuk mengurangi pemanggilan LLM berulang.\nMengintegrasikan context retrieval ke prompt klasifikasi terkontrol dan mengekspor hasil klasifikasi ke Excel.",
        }),
        item({
          title: "Sistem Penyerbuk Kelapa Sawit untuk Integrasi Drone",
          detail: "Python, YOLOv11, Raspberry Pi 5, Computer Vision, Sensor, Aktuator",
          bullets:
            "Mengembangkan solusi AI/ML untuk mendeteksi kematangan bunga betina kelapa sawit secara real-time sebagai dasar otomasi proses bisnis di bidang perkebunan.\nMelakukan training, evaluasi, optimasi, dan deployment model object detection pada edge device Raspberry Pi 5.\nMengintegrasikan kamera, sensor ToF, monitoring volume pollen, dan aktuator untuk mendukung sistem otomasi.",
        }),
      ],
      true,
    ),
    section("achievements", lines("Top 30 Ericsson Hackathon 2025\nTop 10 Hackathon Sawit Nasional 2025\nPenerima Pendanaan PKM-KC 2025").map(title => item({ title }))),
  ],
};

async function main() {
  let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    await auth.api.signUpEmail({ body: { email: DEMO_EMAIL, password: DEMO_PASSWORD, name: "Budi Santoso" } });
    user = await prisma.user.findUniqueOrThrow({ where: { email: DEMO_EMAIL } });
  }
  await prisma.resume.deleteMany({ where: { userId: user.id } });

  const legacy = loadLegacyProfiles();
  const cvs: [string, ResumeContent][] = [["LLM Engineer — Sep 2026", LLM_CV]];
  if (legacy) {
    cvs.push(["AI Engineer", fromLegacy(legacy.ai)], ["Web Developer", fromLegacy(legacy.web)], ["Full-stack Developer", fromLegacy(legacy.full)]);
  }
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
