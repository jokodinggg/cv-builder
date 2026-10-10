import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { getUser } from "@/lib/session";

const FEATURES = [
  { title: "Banyak CV, satu akun", body: "Simpan CV per target lamaran. Mulai dari kosong atau salin CV lama lalu sesuaikan." },
  { title: "Atur urutan bebas", body: "Seret bagian, pengalaman, proyek, dan tautan media sosial ke urutan yang Anda mau." },
  { title: "Pratinjau A4 langsung", body: "Isi otomatis dibagi ke halaman A4. CV dua halaman tampil berdampingan." },
  { title: "PDF rapi", body: "File PDF sama persis dengan pratinjau, teks bisa disalin, nama file otomatis." },
  { title: "Terjemahkan ID ⇄ EN", body: "Buat salinan CV dalam bahasa Inggris atau Indonesia. Istilah teknis tetap utuh." },
];

export default async function HomePage() {
  if (await getUser()) redirect("/dashboard");
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <Logo />
        <nav className="flex gap-2">
          <Link href="/login" className="btn-ghost">Masuk</Link>
          <Link href="/register" className="btn-primary">Daftar gratis</Link>
        </nav>
      </header>
      <section className="py-16 sm:py-24">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-brand">CV builder untuk pencari kerja</p>
        <h1 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
          Susun CV yang rapi, simpan banyak versi, ekspor ke PDF.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Edit di kiri, lihat hasil cetak di kanan. Setiap perubahan tersimpan otomatis di akun Anda.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className="btn-primary px-5 py-3 text-base">Buat CV pertama</Link>
          <Link href="/login" className="btn-secondary px-5 py-3 text-base">Saya sudah punya akun</Link>
        </div>
      </section>
      <section className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(feature => (
          <article key={feature.title} className="rounded-xl border border-line bg-white p-5">
            <h2 className="font-display text-lg font-bold tracking-tight">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
