import { AppHeader } from "@/components/dashboard/app-header";
import { NewResumeDialog } from "@/components/dashboard/new-resume-dialog";
import { ResumeCard } from "@/components/dashboard/resume-card";
import { listResumes } from "@/lib/resume/repository";
import { requireUser } from "@/lib/session";

export const metadata = { title: "CV saya" };

export default async function DashboardPage() {
  const user = await requireUser();
  const resumes = await listResumes(user.id);
  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">CV saya</h1>
            <p className="mt-1 text-muted">Simpan satu CV per target lamaran. Salin CV lama untuk mulai lebih cepat.</p>
          </div>
          <NewResumeDialog resumes={resumes} />
        </div>
        {resumes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#c9d3c6] bg-white p-10 text-center">
            <h2 className="font-display text-xl font-bold">Belum ada CV</h2>
            <p className="mx-auto mt-2 max-w-md text-muted">Buat CV pertama Anda. Kami isi dengan contoh bagian yang bisa langsung Anda ganti.</p>
            <div className="mt-5">
              <NewResumeDialog resumes={resumes} label="Buat CV pertama" />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map(resume => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
