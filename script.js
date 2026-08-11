const experiences = [
  { title: "Full-stack & AI Developer", date: "November 2025 — Saat Ini", company: "Joki Proyek | Freelance", bullets: "Mengerjakan lebih dari 50 project meliputi Web Development, AI/ML, IoT, n8n, dan Automation dengan skala local hingga production.\nBerhasil meraih omset 20 juta dalam 3 bulan pertama." },
  { title: "Full-stack Developer", date: "November 2025 — Saat Ini", company: "Kominfo Balai Monitor I Semarang | Internship On-Site", bullets: "Menyelesaikan permasalahan administrasi dan penyerahan dokumen antar pihak dengan website monitoring perjalanan dinas." }
];
const projects = [
  { title: "Sistem Penyerbuk Kelapa Sawit untuk Integrasi Drone | Python, YOLO, Raspberry Pi 5", description: "Mengembangkan sistem edge AI untuk deteksi objek, monitoring volume pollen real-time, serta kontrol servo dan blower. YOLOv11 mencapai mAP 0,9023 dan 30,85 FPS pada Raspberry Pi 5." },
  { title: "Website Dashboard Monitoring Perjalanan Dinas | Next.js, Express.js", description: "Membangun website monitoring berkas dan membantu administrasi perjalanan dinas menggunakan tech stack Next.js dan Express.js." },
  { title: "Website AI Generator Creative Tools | Next.js, Nest.js", description: "Memudahkan affiliate marketer membuat konten berupa voice over, video, dan foto berbasis AI, lengkap hingga deployment di VPS." }
];

const byId = id => document.getElementById(id);
const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
const lines = value => String(value || "").split("\n").map(item => item.trim()).filter(Boolean);

function renderEditor(type) {
  const target = byId(`${type}-fields`);
  const entries = type === "experience" ? experiences : projects;
  target.innerHTML = entries.map((entry, index) => type === "experience" ? `
    <div class="repeat-card"><button class="remove" data-type="${type}" data-index="${index}" type="button">×</button>
      <label>Jabatan<input data-type="${type}" data-index="${index}" data-key="title" value="${escapeHtml(entry.title)}"></label>
      <label>Periode<input data-type="${type}" data-index="${index}" data-key="date" value="${escapeHtml(entry.date)}"></label>
      <label>Perusahaan / organisasi<input data-type="${type}" data-index="${index}" data-key="company" value="${escapeHtml(entry.company)}"></label>
      <label>Pencapaian <span class="hint">(satu baris satu poin)</span><textarea data-type="${type}" data-index="${index}" data-key="bullets">${escapeHtml(entry.bullets)}</textarea></label>
    </div>` : `
    <div class="repeat-card"><button class="remove" data-type="${type}" data-index="${index}" type="button">×</button>
      <label>Nama proyek dan teknologi<input data-type="${type}" data-index="${index}" data-key="title" value="${escapeHtml(entry.title)}"></label>
      <label>Deskripsi<textarea data-type="${type}" data-index="${index}" data-key="description">${escapeHtml(entry.description)}</textarea></label>
    </div>`).join("");
}

function renderPreview() {
  document.querySelectorAll("[data-bind]").forEach(input => {
    const key = input.dataset.bind;
    const output = byId(`preview-${key}`);
    if (output) {
      const contactText = output.querySelector("span");
      if (contactText) contactText.textContent = input.value;
      else output.textContent = input.value;
    }
  });
  const email = document.querySelector('[data-bind="email"]').value;
  const whatsapp = document.querySelector('[data-bind="whatsapp"]').value;
  const linkedin = document.querySelector('[data-bind="linkedin"]').value;
  const github = document.querySelector('[data-bind="github"]').value;
  byId("preview-email").href = `mailto:${email}`;
  byId("preview-whatsapp").href = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "").replace(/^0/, "62")}`;
  byId("preview-linkedin").href = `https://${linkedin.replace(/^https?:\/\//, "")}`;
  byId("preview-github").href = `https://${github.replace(/^https?:\/\//, "")}`;
  byId("preview-email").querySelector("span").textContent = email;
  byId("preview-whatsapp").querySelector("span").textContent = whatsapp;
  byId("preview-experiences").innerHTML = experiences.map(item => `<article class="role"><div class="role-header"><span class="role-title">${escapeHtml(item.title)}</span><span class="role-date">${escapeHtml(item.date)}</span></div><p class="company">${escapeHtml(item.company)}</p><ul>${lines(item.bullets).map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ul></article>`).join("");
  byId("preview-projects").innerHTML = projects.map(item => `<article class="project"><strong class="project-title">${escapeHtml(item.title)}</strong><ul><li>${escapeHtml(item.description)}</li></ul></article>`).join("");
  byId("preview-achievements").innerHTML = lines(document.querySelector('[data-bind="achievements"]').value).map(item => `<li>${escapeHtml(item)}</li>`).join("");
  byId("preview-education").innerHTML = lines(document.querySelector('[data-bind="education"]').value).map(line => { const [name, date = "", note = ""] = line.split("|").map(value => value.trim()); return `<div class="edu-row"><div><span class="edu-name">${escapeHtml(name)}</span>${note ? `<p class="edu-note">${escapeHtml(note)}</p>` : ""}</div><span class="edu-date">${escapeHtml(date)}</span></div>`; }).join("");
}

function updateRepeat(event) {
  const input = event.target;
  if (!input.dataset.type || !input.dataset.key) return;
  const collection = input.dataset.type === "experience" ? experiences : projects;
  collection[Number(input.dataset.index)][input.dataset.key] = input.value;
  renderPreview();
}

document.addEventListener("input", event => { if (event.target.dataset.bind) renderPreview(); updateRepeat(event); });
document.addEventListener("click", event => {
  const remove = event.target.closest(".remove");
  if (remove) { const list = remove.dataset.type === "experience" ? experiences : projects; list.splice(Number(remove.dataset.index), 1); renderEditor(remove.dataset.type); renderPreview(); }
});
byId("add-experience").addEventListener("click", () => { experiences.push({ title:"Jabatan", date:"Tahun — Tahun", company:"Perusahaan", bullets:"Jelaskan pencapaian utama." }); renderEditor("experience"); renderPreview(); });
byId("add-project").addEventListener("click", () => { projects.push({ title:"Nama proyek | Teknologi", description:"Jelaskan masalah, solusi, dan hasil proyek." }); renderEditor("project"); renderPreview(); });
byId("print-button").addEventListener("click", () => window.print());
renderEditor("experience"); renderEditor("project"); renderPreview();
