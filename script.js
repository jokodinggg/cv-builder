const STORAGE_KEY = "jokoding-cv-builder-v6";
const LEGACY_STORAGE_KEYS = ["jokoding-cv-builder-v4", "jokoding-cv-builder-v3"];
const WEB_PROJECTS_VERSION = 2;
let language = "id";
const UI_COPY = {
  id: { builderTitle:"Buat CV baru", builderSubtitle:"Ubah detail CV di bawah. Pratinjau akan diperbarui secara langsung.", identity:"Identitas", fullName:"Nama lengkap", skills:"Keterampilan", skillsHelp:"Buat kategori sendiri, lalu isi teknologi atau kemampuan yang relevan.", addSkill:"+ Tambah kategori keterampilan", experience:"Pengalaman", addExperience:"+ Tambah pengalaman", projects:"Proyek pilihan", selectedProjects:"Proyek Pilihan", addProject:"+ Tambah proyek", achievementEducation:"Prestasi & pendidikan", achievements:"Prestasi", education:"Pendidikan", readyToPrint:"Pratinjau siap dicetak", translateButton:"Translate to English" },
  en: { builderTitle:"Create a new CV", builderSubtitle:"Edit the details below. The preview updates instantly.", identity:"Personal details", fullName:"Full name", skills:"Skills", skillsHelp:"Create your own categories, then list the relevant technologies or capabilities.", addSkill:"+ Add skill category", experience:"Experience", addExperience:"+ Add experience", projects:"Selected projects", selectedProjects:"Selected Projects", addProject:"+ Add project", achievementEducation:"Achievements & education", achievements:"Achievements", education:"Education", readyToPrint:"Preview ready to print", translateButton:"Switch to Indonesian" }
};

const AI_ENGINEER_PROFILE = {
  form: {
    achievements: "Top 30 Ericsson Hackathon 2025\nTop 10 Hackathon Sawit Nasional 2025\nPenerima Pendanaan PKM-KC 2025",
    education: "S1 Teknologi Informasi, Institut Teknologi Sepuluh Nopember | 2022 — 2026 | IPK 3,74/4,00\nSMA Negeri 5 Semarang | 2018 — 2021 |"
  },
  experiences: [
  {
    title: "Full-stack Developer & AI Engineer",
    date: "November 2025 — Saat Ini",
    company: "Freelance",
    bullets: "Menyelesaikan lebih dari 50 proyek pengembangan perangkat lunak yang mencakup Web Development, AI/ML, IoT, automation, dan integrasi API.\nMengembangkan solusi dari tahap analisis kebutuhan, implementasi, hingga deployment untuk berbagai kebutuhan klien."
  },
  {
    title: "Full-stack Developer",
    date: "November 2025 — Februari 2026",
    company: "Kominfo Balai Monitor I Semarang | Internship On-Site",
    bullets: "Menyelesaikan permasalahan administrasi dan penyerahan dokumen antar pihak dengan website monitoring perjalanan dinas."
  }
  ],

  projects: [
  {
    title: "Sistem Penyerbuk Kelapa Sawit untuk Integrasi Drone",
    tech: "Python, YOLO, Raspberry Pi",
    bullets: "Mengembangkan sistem Computer Vision berbasis YOLOv11 untuk mendeteksi kematangan bunga betina kelapa sawit secara real-time sebagai dasar aktivasi mekanisme penyerbukan otomatis.\nMelakukan training, evaluasi, optimasi, dan deployment model object detection pada Raspberry Pi 5 sebagai edge device untuk menjalankan inferensi secara real-time.\nMengintegrasikan kamera, sensor ToF VL53L0X, dan aktuator untuk monitoring volume pollen serta mengontrol mekanisme penyemprotan pollen secara otomatis.\nMerancang sistem agar dapat diintegrasikan dengan drone sebagai platform penyerbukan otomatis pada perkebunan kelapa sawit."
  },
  {
    title: "Sistem Pemilah Sampah Otomatis Berbasis Computer Vision",
    tech: "Python, MobileNet, TensorFlow, OpenCV, ESP32, MQTT",
    bullets: "Mengembangkan sistem Computer Vision berbasis MobileNet untuk mengklasifikasikan sampah secara real-time ke dalam kategori organik dan anorganik.\nMengimplementasikan inference model menggunakan TensorFlow/Keras dan OpenCV, serta mengintegrasikan hasil prediksi dengan sistem embedded berbasis ESP32 melalui protokol MQTT.\nMengintegrasikan sensor ultrasonik, LCD, dan servo untuk membangun mekanisme pemilahan sampah otomatis berdasarkan hasil klasifikasi AI."
  }
  ],

  skills: [
  { category: "Bahasa Pemrograman", details: "Python, JavaScript, TypeScript, C/C++, HTML, CSS, Bash" },
  { category: "AI & Computer Vision", details: "YOLO, MobileNet, PyTorch, TensorFlow, OpenCV, Scikit-learn, Pandas, NumPy" },
  { category: "Web & Backend", details: "Next.js, Express.js, NestJS, REST API" },
  { category: "Database", details: "MySQL, PostgreSQL, Prisma" },
  { category: "IoT & Edge Computing", details: "Raspberry Pi, ESP32, Sensor & Actuator Integration" },
  { category: "Tools & Platform", details: "Git, Linux, Docker, n8n, Figma" }
  ]
};

const WEB_DEVELOPER_PROFILE = {
  form: {
    achievements: "Top 30 Ericsson Hackathon 2025\nTop 10 Hackathon Sawit Nasional 2025\nPenerima Pendanaan PKM-KC 2025",
    education: "S1 Teknologi Informasi, Institut Teknologi Sepuluh Nopember | 2022 — 2026 | IPK 3,74/4,00\nSMA Negeri 5 Semarang | 2018 — 2021 |"
  },
  experiences: [
    { title: "Full-stack Developer", date: "November 2025 — Saat Ini", company: "Freelance", bullets: "Menyelesaikan lebih dari 50 proyek pengembangan perangkat lunak yang mencakup website, API, automation, dan integrasi layanan pihak ketiga.\nMengembangkan solusi dari tahap analisis kebutuhan, implementasi, hingga deployment untuk berbagai kebutuhan klien." },
    { title: "Full-stack Developer", date: "November 2025 — Februari 2026", company: "Kominfo Balai Monitor I Semarang | Internship On-Site", bullets: "Mengembangkan website monitoring perjalanan dinas untuk menyelesaikan kebutuhan administrasi dan penyerahan dokumen antar pihak." }
  ],
  projects: [
    { title: "Monitoring Dashboard Perjalanan Dinas", tech: "Next.js, TypeScript, Tailwind CSS, Express.js, Prisma, PostgreSQL", bullets: "Mengembangkan sistem monitoring workflow perjalanan dinas dengan 15 tahapan proses, termasuk alur LS dan Non-LS.\nMembangun dashboard, pelacakan progres, manajemen pengguna berbasis role, upload dokumen, serta fitur pencarian dan pengarsipan data.\nMengintegrasikan frontend Next.js dengan REST API Express dan database PostgreSQL melalui Prisma ORM." },
    { title: "POS SaaS Multi-Tenant", tech: "React, Vite, Tailwind CSS, Fastify, Prisma, PostgreSQL, Redis, Midtrans", bullets: "Mengembangkan aplikasi Point of Sale berbasis SaaS dengan arsitektur multi-tenant dan dukungan multi-outlet.\nMembangun fitur manajemen produk, transaksi, inventori, pelanggan, karyawan, absensi, serta laporan penjualan dan profit.\nMengintegrasikan sistem pembayaran Midtrans untuk metode QRIS dan kartu." },
    { title: "SIAKAD Gallery - Sistem Informasi KRS Mahasiswa", tech: "Laravel, PHP, MySQL, Blade", bullets: "Mengembangkan sistem informasi akademik untuk pengisian KRS, KHS, jadwal, dan manajemen data mahasiswa.\nMenerapkan akses berbasis peran untuk mahasiswa, dosen, dan admin, termasuk fitur input nilai dan pengelolaan mata kuliah.\nMendesain struktur halaman dan komponen Blade yang responsif untuk kebutuhan administrasi akademik." },
    { title: "AbsensiSholat", tech: "Next.js, Supabase, PostgreSQL, QR Code", bullets: "Mengembangkan aplikasi absensi sholat berbasis QR untuk membantu guru memantau kehadiran siswa secara harian.\nMembangun dashboard guru, rekap absensi harian hingga bulanan, manajemen data siswa, dan import data CSV/Excel.\nMengintegrasikan Supabase untuk penyimpanan data dan pembaruan dashboard secara realtime." },
    { title: "Mental Wellness Tracker", tech: "Next.js, TypeScript, Express.js, PostgreSQL, Prisma, NextAuth, face-api.js", bullets: "Mengembangkan aplikasi pencatatan mood, jurnal, target, dan rekomendasi aktivitas untuk pemantauan kesehatan mental.\nMengimplementasikan deteksi emosi real-time melalui webcam menggunakan face-api.js tanpa menyimpan data wajah pengguna.\nMembangun autentikasi, dashboard analitik, REST API, serta pengelolaan data menggunakan Prisma dan PostgreSQL." }
  ],
  skills: [
    { category: "Bahasa Pemrograman", details: "JavaScript, TypeScript, Python, HTML, CSS, Bash" },
    { category: "Frontend", details: "Next.js, React, HTML, CSS" },
    { category: "Backend & API", details: "Node.js, Express.js, NestJS, REST API" },
    { category: "Database", details: "MySQL, PostgreSQL, Prisma" },
    { category: "Tools & Platform", details: "Git, Linux, Docker, Figma" }
  ]
};

const FULL_STACK_DEVELOPER_PROFILE = {
  form: {
    achievements: "Top 30 Ericsson Hackathon 2025\nTop 10 Hackathon Sawit Nasional 2025\nPenerima Pendanaan PKM-KC 2025",
    education: "S1 Teknologi Informasi, Institut Teknologi Sepuluh Nopember | 2022 — 2026 | IPK 3,74/4,00\nSMA Negeri 5 Semarang | 2018 — 2021 |"
  },
  experiences: WEB_DEVELOPER_PROFILE.experiences.map(item => ({ ...item })),
  projects: [
    { title: "Website Monitoring Perjalanan Dinas", tech: "Next.js, TypeScript, PostgreSQL, Prisma", bullets: "Mengembangkan aplikasi web untuk memantau proses perjalanan dinas dan penyerahan dokumen.\nMembangun antarmuka responsif dan integrasi data untuk pelacakan status administrasi." },
    { title: "Sistem Penyerbuk Kelapa Sawit untuk Integrasi Drone", tech: "Python, YOLO, Raspberry Pi, REST API", bullets: "Mengembangkan sistem Computer Vision berbasis YOLOv11 untuk mendeteksi kematangan bunga kelapa sawit secara real-time.\nMengintegrasikan model edge AI, sensor, aktuator, dan komponen perangkat lunak untuk mendukung otomasi penyerbukan." }
  ],
  skills: [
    { category: "Bahasa Pemrograman", details: "JavaScript, TypeScript, Python, C/C++, HTML, CSS" },
    { category: "Frontend & Backend", details: "Next.js, React, Express.js, NestJS, REST API" },
    { category: "Database", details: "MySQL, PostgreSQL, Prisma" },
    { category: "AI & IoT", details: "YOLO, OpenCV, Raspberry Pi, ESP32, MQTT" },
    { category: "Tools & Platform", details: "Git, Linux, Docker, Figma" }
  ]
};

const IOT_ENGINEER_PROFILE = {
  form: {
    achievements: "Top 30 Ericsson Hackathon 2025\nTop 10 Hackathon Sawit Nasional 2025\nPenerima Pendanaan PKM-KC 2025",
    education: "S1 Teknologi Informasi, Institut Teknologi Sepuluh Nopember | 2022 — 2026 | IPK 3,74/4,00\nSMA Negeri 5 Semarang | 2018 — 2021 |"
  },
  experiences: [
    { title: "Full-stack Developer & AI Engineer", date: "November 2025 — Saat Ini", company: "Freelance", bullets: "Menyelesaikan proyek perangkat lunak yang mencakup IoT, edge AI, integrasi API, dan otomasi.\nMengembangkan solusi dari analisis kebutuhan dan integrasi perangkat hingga implementasi aplikasi pendukung." },
    { title: "Full-stack Developer", date: "November 2025 — Februari 2026", company: "Kominfo Balai Monitor I Semarang | Internship On-Site", bullets: "Mengembangkan website monitoring perjalanan dinas untuk mendukung pemantauan workflow administrasi dan penyerahan dokumen." }
  ],
  projects: [
    { title: "Child Monitoring Wearable IoT", tech: "Python, Antares IoT, Telegram Bot API, Webhook, SQLite, Geolocation", bullets: "Mengembangkan platform monitoring anak yang menerima data perangkat wearable melalui webhook Antares IoT.\nMembangun alur notifikasi Telegram untuk monitoring lokasi, deteksi kondisi terjatuh, dan pemisahan akses parent–teacher.\nMerancang mapping parent–child–teacher, dukungan multiple children, device-specific endpoint, serta health-check endpoint." },
    { title: "Sistem Pemilah Sampah Otomatis", tech: "Python, MobileNet, TensorFlow, OpenCV, ESP32, MQTT", bullets: "Mengembangkan sistem Computer Vision untuk klasifikasi sampah organik dan anorganik secara real-time.\nMengirim hasil inferensi ke sistem embedded ESP32 melalui MQTT untuk mengendalikan sensor, LCD, dan servo.\nMengintegrasikan model AI dengan perangkat keras dan aktuator untuk membangun alur pemilahan otomatis." },
    { title: "Sistem Penyerbuk Kelapa Sawit untuk Integrasi Drone", tech: "Python, YOLOv11, Raspberry Pi 5, ToF VL53L0X, Sensor, Aktuator", bullets: "Mengembangkan sistem edge AI untuk mendeteksi kematangan bunga betina kelapa sawit secara real-time sebagai dasar aktivasi mekanisme penyerbukan.\nMelakukan training, evaluasi, optimasi, dan deployment object detection pada Raspberry Pi 5.\nMengintegrasikan kamera, sensor ToF, volume pollen monitoring, dan aktuator penyemprotan untuk mendukung otomasi perangkat." }
  ],
  skills: [
    { category: "Bahasa Pemrograman", details: "Python, C/C++, JavaScript, TypeScript, Bash" },
    { category: "Embedded & Edge Computing", details: "ESP32, Raspberry Pi 5, Sensor, Aktuator, Edge AI" },
    { category: "IoT & Communication", details: "MQTT, Antares IoT, Webhook, Telegram Bot API, REST API" },
    { category: "AI & Computer Vision", details: "YOLOv11, MobileNet, TensorFlow, OpenCV, NumPy" },
    { category: "Data & Backend", details: "SQLite, PostgreSQL, Python Web Services" },
    { category: "Tools & Platform", details: "Git, Linux, Docker, Geolocation, Figma" }
  ]
};

let profiles = {
  "ai-engineer": AI_ENGINEER_PROFILE,
  "web-developer": WEB_DEVELOPER_PROFILE,
  "full-stack-developer": FULL_STACK_DEVELOPER_PROFILE,
  "iot-engineer": IOT_ENGINEER_PROFILE
};
let profileNames = {
  "ai-engineer": "AI Engineer",
  "web-developer": "Web Developer",
  "full-stack-developer": "Full-stack Developer",
  "iot-engineer": "IoT Engineer"
};
let selectedProfile = "iot-engineer";
let experiences = profiles[selectedProfile].experiences;
let projects = profiles[selectedProfile].projects;
let skills = profiles[selectedProfile].skills;

const byId = id => document.getElementById(id);
const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
const lines = value => String(value || "").split("\n").map(item => item.trim()).filter(Boolean);
const collectionFor = type => type === "experience" ? experiences : type === "project" ? projects : skills;

function renderEditor(type) {
  const target = byId(`${type}-fields`);
  const entries = collectionFor(type);
  target.innerHTML = entries.map((entry, index) => {
    const remove = `<button class="remove" data-type="${type}" data-index="${index}" type="button" aria-label="Hapus">×</button>`;
    if (type === "experience") return `
      <div class="repeat-card">${remove}
        <label>Jabatan<input data-type="${type}" data-index="${index}" data-key="title" value="${escapeHtml(entry.title)}"></label>
        <label>Periode<input data-type="${type}" data-index="${index}" data-key="date" value="${escapeHtml(entry.date)}"></label>
        <label>Perusahaan / organisasi<input data-type="${type}" data-index="${index}" data-key="company" value="${escapeHtml(entry.company)}"></label>
        <label>Pencapaian <span class="hint">(satu baris satu poin)</span><textarea data-type="${type}" data-index="${index}" data-key="bullets">${escapeHtml(entry.bullets)}</textarea></label>
      </div>`;
    if (type === "project") return `
      <div class="repeat-card">${remove}
        <label>Judul proyek<input data-type="${type}" data-index="${index}" data-key="title" value="${escapeHtml(entry.title)}"></label>
        <label>Tech stack<input data-type="${type}" data-index="${index}" data-key="tech" value="${escapeHtml(entry.tech)}"></label>
        <label>Pencapaian / deskripsi <span class="hint">(satu baris satu poin)</span><textarea data-type="${type}" data-index="${index}" data-key="bullets">${escapeHtml(entry.bullets)}</textarea></label>
      </div>`;
    return `
      <div class="repeat-card">${remove}
        <label>Nama kategori<input data-type="${type}" data-index="${index}" data-key="category" value="${escapeHtml(entry.category)}"></label>
        <label>Daftar keterampilan<input data-type="${type}" data-index="${index}" data-key="details" value="${escapeHtml(entry.details)}"></label>
      </div>`;
  }).join("");
}

let saveTimer = null;
let serverStateReady = false;

function currentState() {
  const form = Object.fromEntries([...document.querySelectorAll("[data-bind]")].map(input => [input.dataset.bind, input.value]));
  const personal = Object.fromEntries(["name", "email", "whatsapp", "linkedin", "github"].map(key => [key, form[key]]));
  profiles[selectedProfile] = { form: { achievements: form.achievements, education: form.education }, experiences, projects, skills };
  return { personal, profiles, profileNames, selectedProfile, language, webProjectsVersion: WEB_PROJECTS_VERSION };
}

function persistState() {
  try {
    const state = currentState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (!serverStateReady) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      fetch("/api/state", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(state) })
        .catch(error => console.warn("Server-side CV storage unavailable; local storage remains active.", error));
    }, 250);
  } catch (_) { /* Penyimpanan lokal tidak tersedia; CV tetap dapat digunakan. */ }
}

function renderProfileOptions() {
  const select = byId("cv-type");
  select.innerHTML = Object.entries(profileNames)
    .filter(([id]) => profiles[id])
    .map(([id, name]) => `<option value="${escapeHtml(id)}">${escapeHtml(name)}</option>`)
    .join("");
  select.value = selectedProfile;
}

function useProfile(profileId) {
  selectedProfile = profileId;
  const profile = profiles[selectedProfile];
  experiences = profile.experiences;
  projects = profile.projects;
  skills = profile.skills;
  byId("cv-type").value = selectedProfile;
  ["achievements", "education"].forEach(key => {
    document.querySelector(`[data-bind="${key}"]`).value = profile.form[key] || "";
  });
}

function restoreState(savedState = null) {
  try {
    const rawState = savedState || localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map(key => localStorage.getItem(key)).find(Boolean);
    const state = typeof rawState === "string" ? JSON.parse(rawState) : rawState;
    if (!state) return;
    if (state.profiles && typeof state.profiles === "object") profiles = state.profiles;
    if (state.profileNames && typeof state.profileNames === "object") profileNames = state.profileNames;
    if (state.selectedProfile && profiles[state.selectedProfile]) selectedProfile = state.selectedProfile;
    if (Array.isArray(state.experiences)) {
      profiles[selectedProfile] = {
        form: { achievements: state.form?.achievements || "", education: state.form?.education || "" },
        experiences: state.experiences,
        projects: Array.isArray(state.projects) ? state.projects : projects,
        skills: Array.isArray(state.skills) ? state.skills : skills
      };
    }
    if (state.webProjectsVersion !== WEB_PROJECTS_VERSION && profiles["web-developer"]) {
      profiles["web-developer"].projects = WEB_DEVELOPER_PROFILE.projects.map(project => ({ ...project }));
    }
    if (state.language === "en" || state.language === "id") language = state.language;
    Object.entries(state.personal || state.form || {}).forEach(([key, value]) => {
      const input = document.querySelector(`[data-bind="${key}"]`);
      if (input) input.value = value;
    });
    useProfile(selectedProfile);
  } catch (_) { /* Jika data lama tidak valid, gunakan isi default. */ }
}

function applyUiLanguage() {
  const copy = UI_COPY[language];
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = copy[element.dataset.i18n] || element.textContent;
  });
  byId("translate-button").textContent = copy.translateButton;
}

async function translateText(text, source, target) {
  const value = String(text || "").trim();
  if (!value) return text;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(value)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Translation request failed");
  const data = await response.json();
  return data[0].map(part => part[0]).join("");
}

async function translateCv() {
  const button = byId("translate-button");
  const source = language;
  const target = source === "id" ? "en" : "id";
  button.disabled = true;
  button.textContent = target === "en" ? "Translating…" : "Menerjemahkan…";
  try {
    const boundKeys = ["achievements", "education"];
    const textFields = boundKeys.map(key => document.querySelector(`[data-bind="${key}"]`));
    const allTasks = [
      ...textFields.map(field => translateText(field.value, source, target)),
      ...skills.flatMap(skill => [translateText(skill.category, source, target), translateText(skill.details, source, target)]),
      ...experiences.flatMap(item => [translateText(item.title, source, target), translateText(item.company, source, target), translateText(item.bullets, source, target)]),
      ...projects.flatMap(item => [translateText(item.title, source, target), translateText(item.tech, source, target), translateText(item.bullets, source, target)])
    ];
    const translated = await Promise.all(allTasks);
    let cursor = 0;
    textFields.forEach(field => { field.value = translated[cursor++]; });
    skills.forEach(skill => { skill.category = translated[cursor++]; skill.details = translated[cursor++]; });
    experiences.forEach(item => { item.title = translated[cursor++]; item.company = translated[cursor++]; item.bullets = translated[cursor++]; });
    projects.forEach(item => { item.title = translated[cursor++]; item.tech = translated[cursor++]; item.bullets = translated[cursor++]; });
    language = target;
    renderEditor("skill"); renderEditor("experience"); renderEditor("project");
    renderPreview();
  } catch (error) {
    alert("Terjemahan otomatis membutuhkan koneksi internet. Periksa koneksi Anda lalu coba lagi.");
    console.error(error);
  } finally {
    button.disabled = false;
    applyUiLanguage();
  }
}

function renderPreview() {
  applyUiLanguage();
  document.querySelectorAll("[data-bind]").forEach(input => {
    const output = byId(`preview-${input.dataset.bind}`);
    if (!output) return;
    const contactText = output.querySelector("span");
    if (contactText) contactText.textContent = input.value;
    else output.textContent = input.value;
  });

  const email = document.querySelector('[data-bind="email"]').value;
  const whatsapp = document.querySelector('[data-bind="whatsapp"]').value;
  const linkedin = document.querySelector('[data-bind="linkedin"]').value;
  const github = document.querySelector('[data-bind="github"]').value;
  byId("preview-email").href = `mailto:${email}`;
  byId("preview-whatsapp").href = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "").replace(/^0/, "62")}`;
  byId("preview-linkedin").href = `https://${linkedin.replace(/^https?:\/\//, "")}`;
  byId("preview-github").href = `https://${github.replace(/^https?:\/\//, "")}`;

  byId("preview-skills").innerHTML = skills.map(item => `<p><strong>${escapeHtml(item.category)}:</strong> ${escapeHtml(item.details)}</p>`).join("");
  byId("preview-experiences").innerHTML = experiences.map(item => `<article class="role"><div class="role-header"><span class="role-title">${escapeHtml(item.title)}</span><span class="role-date">${escapeHtml(item.date)}</span></div><p class="company">${escapeHtml(item.company)}</p><ul>${lines(item.bullets).map(bullet => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul></article>`).join("");
  byId("preview-projects").innerHTML = projects.map(item => `<article class="project"><div class="project-title">${escapeHtml(item.title)}</div><p class="project-tech">${escapeHtml(item.tech)}</p><ul>${lines(item.bullets).map(bullet => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul></article>`).join("");
  byId("preview-achievements").innerHTML = lines(document.querySelector('[data-bind="achievements"]').value).map(item => `<li>${escapeHtml(item)}</li>`).join("");
  byId("preview-education").innerHTML = lines(document.querySelector('[data-bind="education"]').value).map(line => {
    const [name, date = "", note = ""] = line.split("|").map(value => value.trim());
    return `<div class="edu-row"><div><span class="edu-name">${escapeHtml(name)}</span>${note ? `<p class="edu-note">${escapeHtml(note)}</p>` : ""}</div><span class="edu-date">${escapeHtml(date)}</span></div>`;
  }).join("");
  persistState();
}

async function loadServerState() {
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (!response.ok) throw new Error(`State request failed: ${response.status}`);
    const state = await response.json();
    if (state && state.profiles) {
      restoreState(state);
      useProfile(selectedProfile);
      renderProfileOptions();
      renderEditor("skill");
      renderEditor("experience");
      renderEditor("project");
      renderPreview();
    }
    serverStateReady = true;
    if (!state) persistState();
  } catch (error) {
    serverStateReady = true;
    console.warn("SQLite storage unavailable; using browser local storage.", error);
  }
}

function updateRepeat(event) {
  const input = event.target;
  if (!input.dataset.type || !input.dataset.key) return;
  collectionFor(input.dataset.type)[Number(input.dataset.index)][input.dataset.key] = input.value;
  renderPreview();
}

document.addEventListener("input", event => {
  if (event.target.dataset.bind) renderPreview();
  updateRepeat(event);
});
document.addEventListener("focusin", event => {
  const fieldset = event.target.closest("fieldset[data-preview-target]");
  if (!fieldset) return;
  // Field pendidikan berada dalam fieldset yang sama dengan prestasi.
  const targetSelector = event.target.dataset.bind === "education" ? "#preview-education" : fieldset.dataset.previewTarget;
  const target = document.querySelector(targetSelector);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
});
document.addEventListener("click", event => {
  const remove = event.target.closest(".remove");
  if (!remove) return;
  collectionFor(remove.dataset.type).splice(Number(remove.dataset.index), 1);
  renderEditor(remove.dataset.type);
  renderPreview();
});
byId("add-skill").addEventListener("click", () => { skills.push({ category: "Kategori keterampilan", details: "Skill 1, Skill 2" }); renderEditor("skill"); renderPreview(); });
byId("add-experience").addEventListener("click", () => { experiences.push({ title: "Jabatan", date: "Tahun — Tahun", company: "Perusahaan", bullets: "Jelaskan pencapaian utama." }); renderEditor("experience"); renderPreview(); });
byId("add-project").addEventListener("click", () => { projects.push({ title: "Nama proyek", tech: "Teknologi", bullets: "Jelaskan capaian proyek." }); renderEditor("project"); renderPreview(); });
byId("print-button").addEventListener("click", () => window.print());
byId("translate-button").addEventListener("click", translateCv);
byId("cv-type").addEventListener("change", event => {
  persistState();
  useProfile(event.target.value);
  renderEditor("skill");
  renderEditor("experience");
  renderEditor("project");
  renderPreview();
});
byId("add-cv-type").addEventListener("click", () => {
  const input = byId("new-cv-type");
  const name = input.value.trim();
  if (!name) return;
  if (Object.values(profileNames).some(profileName => profileName.toLowerCase() === name.toLowerCase())) {
    alert("Tipe CV dengan nama tersebut sudah ada.");
    return;
  }
  persistState();
  const id = `custom-${Date.now()}`;
  profiles[id] = JSON.parse(JSON.stringify(profiles[selectedProfile]));
  profileNames[id] = name;
  input.value = "";
  useProfile(id);
  renderProfileOptions();
  renderEditor("skill");
  renderEditor("experience");
  renderEditor("project");
  renderPreview();
});

restoreState();
useProfile(selectedProfile);
renderProfileOptions();
renderEditor("skill");
renderEditor("experience");
renderEditor("project");
renderPreview();
loadServerState();
