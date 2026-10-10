import { newId } from "./ids";
import type { Item, Language, ResumeContent, Section, SectionType } from "./schema";

export const SECTION_TITLES: Record<SectionType, Record<Language, string>> = {
  summary: { id: "Ringkasan", en: "Summary" },
  education: { id: "Pendidikan", en: "Education" },
  skills: { id: "Keterampilan", en: "Skills" },
  experience: { id: "Pengalaman", en: "Experience" },
  projects: { id: "Proyek Pilihan", en: "Selected Projects" },
  achievements: { id: "Prestasi", en: "Achievements" },
  custom: { id: "Bagian Lain", en: "Other" },
};

type ItemField = "title" | "subtitle" | "date" | "detail" | "bullets";

/** Which item fields a section type uses, with the editor label (Indonesian UI). Absent = hidden. */
export const FIELD_CONFIG: Record<SectionType, Partial<Record<ItemField, string>>> = {
  summary: { detail: "Ringkasan profil" },
  education: { title: "Institusi / jurusan", date: "Tahun", detail: "Keterangan (mis. IPK)" },
  skills: { title: "Nama kategori", detail: "Daftar keterampilan" },
  experience: { title: "Jabatan", date: "Periode", subtitle: "Perusahaan / organisasi", bullets: "Pencapaian (satu baris satu poin)" },
  projects: { title: "Nama proyek", date: "Periode (opsional)", detail: "Tech stack", subtitle: "Tautan (opsional)", bullets: "Deskripsi (satu baris satu poin)" },
  achievements: { title: "Prestasi" },
  custom: { title: "Judul", date: "Periode", subtitle: "Subjudul", bullets: "Poin (satu baris satu poin)" },
};

const EXAMPLE_ITEMS: Record<SectionType, Record<Language, Partial<Item>>> = {
  summary: {
    id: { detail: "Tulis 2–3 kalimat tentang keahlian utama dan tujuan karier Anda." },
    en: { detail: "Write 2–3 sentences about your core strengths and career goal." },
  },
  education: {
    id: { title: "S1 Nama Jurusan, Nama Universitas", date: "2022 — 2026", detail: "IPK 3,50/4,00" },
    en: { title: "B.Sc. Major, University Name", date: "2022 — 2026", detail: "GPA 3.50/4.00" },
  },
  skills: {
    id: { title: "Bahasa Pemrograman", detail: "Python, JavaScript, TypeScript" },
    en: { title: "Programming Languages", detail: "Python, JavaScript, TypeScript" },
  },
  experience: {
    id: { title: "Jabatan", date: "Januari 2025 — Saat Ini", subtitle: "Nama Perusahaan", bullets: "Jelaskan pencapaian utama dengan angka.\nJelaskan dampak pekerjaan Anda." },
    en: { title: "Job Title", date: "January 2025 — Present", subtitle: "Company Name", bullets: "Describe a key achievement with numbers.\nDescribe the impact of your work." },
  },
  projects: {
    id: { title: "Nama Proyek", detail: "Next.js, PostgreSQL", bullets: "Jelaskan masalah yang diselesaikan.\nJelaskan hasil atau dampaknya." },
    en: { title: "Project Name", detail: "Next.js, PostgreSQL", bullets: "Describe the problem it solves.\nDescribe the result or impact." },
  },
  achievements: { id: { title: "Juara 1 Lomba Nasional 2025" }, en: { title: "1st Place, National Competition 2025" } },
  custom: { id: { title: "Judul" }, en: { title: "Title" } },
};

export function defaultSectionTitle(type: SectionType, language: Language): string {
  return SECTION_TITLES[type][language];
}

export function sectionTitle(section: Pick<Section, "type" | "title">, language: Language): string {
  return section.title.trim() || defaultSectionTitle(section.type, language);
}

export function createItem(type: SectionType, language: Language): Item {
  return { id: newId(), title: "", subtitle: "", date: "", detail: "", bullets: "", visible: true, ...EXAMPLE_ITEMS[type][language] };
}

export function createSection(type: SectionType, language: Language): Section {
  return { id: newId(), type, title: "", visible: true, pageBreakBefore: false, items: [createItem(type, language)] };
}

export const DEFAULT_SECTION_ORDER: SectionType[] = ["education", "skills", "experience", "projects", "achievements"];

export function createBlankContent(language: Language): ResumeContent {
  return {
    schemaVersion: 1,
    personal: { fullName: "", headline: "" },
    links: [
      { id: newId(), type: "whatsapp", value: "", visible: true },
      { id: newId(), type: "email", value: "", visible: true },
      { id: newId(), type: "linkedin", value: "", visible: true },
      { id: newId(), type: "github", value: "", visible: true },
    ],
    sections: DEFAULT_SECTION_ORDER.map(type => createSection(type, language)),
  };
}
