const STORAGE_KEY = "jokoding-cv-builder-v3";
let language = "id";
const UI_COPY = {
  id: { builderTitle:"Buat CV baru", builderSubtitle:"Ubah detail CV di bawah. Pratinjau akan diperbarui secara langsung.", identity:"Identitas", fullName:"Nama lengkap", profile:"Profil singkat", summary:"Ringkasan", skills:"Keterampilan", skillsHelp:"Buat kategori sendiri, lalu isi teknologi atau kemampuan yang relevan.", addSkill:"+ Tambah kategori keterampilan", experience:"Pengalaman", addExperience:"+ Tambah pengalaman", projects:"Proyek pilihan", selectedProjects:"Proyek Pilihan", addProject:"+ Tambah proyek", achievementEducation:"Prestasi & pendidikan", achievements:"Prestasi", education:"Pendidikan", readyToPrint:"Pratinjau siap dicetak", translateButton:"Translate to English" },
  en: { builderTitle:"Create a new CV", builderSubtitle:"Edit the details below. The preview updates instantly.", identity:"Personal details", fullName:"Full name", profile:"Professional summary", summary:"Summary", skills:"Skills", skillsHelp:"Create your own categories, then list the relevant technologies or capabilities.", addSkill:"+ Add skill category", experience:"Experience", addExperience:"+ Add experience", projects:"Selected projects", selectedProjects:"Selected Projects", addProject:"+ Add project", achievementEducation:"Achievements & education", achievements:"Achievements", education:"Education", readyToPrint:"Preview ready to print", translateButton:"Switch to Indonesian" }
};

let experiences = [
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
];

let projects = [
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
];

let skills = [
  { category: "Bahasa Pemrograman", details: "Python, JavaScript, TypeScript, C/C++, HTML, CSS, Bash" },
  { category: "AI & Computer Vision", details: "YOLO, MobileNet, PyTorch, TensorFlow, OpenCV, Scikit-learn, Pandas, NumPy" },
  { category: "Web & Backend", details: "Next.js, Express.js, NestJS, REST API" },
  { category: "Database", details: "MySQL, PostgreSQL, Prisma" },
  { category: "IoT & Edge Computing", details: "Raspberry Pi, ESP32, Sensor & Actuator Integration" },
  { category: "Tools & Platform", details: "Git, Linux, Docker, n8n, Figma" }
];

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

function persistState() {
  try {
    const form = Object.fromEntries([...document.querySelectorAll("[data-bind]")].map(input => [input.dataset.bind, input.value]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, experiences, projects, skills, language }));
  } catch (_) { /* Penyimpanan lokal tidak tersedia; CV tetap dapat digunakan. */ }
}

function restoreState() {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!state) return;
    if (Array.isArray(state.experiences)) experiences = state.experiences;
    if (Array.isArray(state.projects)) projects = state.projects;
    if (Array.isArray(state.skills)) skills = state.skills;
    if (state.language === "en" || state.language === "id") language = state.language;
    Object.entries(state.form || {}).forEach(([key, value]) => {
      const input = document.querySelector(`[data-bind="${key}"]`);
      if (input) input.value = value;
    });
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
    const boundKeys = ["summary", "achievements", "education"];
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

restoreState();
renderEditor("skill");
renderEditor("experience");
renderEditor("project");
renderPreview();
