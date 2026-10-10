import { auth } from "@/lib/auth";
import { renderPdf } from "@/lib/pdf/browser";
import { pdfFileName } from "@/lib/pdf/filename";
import { rateLimit } from "@/lib/rate-limit";
import { getResume } from "@/lib/resume/repository";

export const runtime = "nodejs";
export const maxDuration = 60;

const json = (status: number, error: string) => Response.json({ error }, { status });

// Fixed origin, never the request Host header: the server forwards the user's cookie to it.
const renderOrigin = () => process.env.PDF_RENDER_ORIGIN || process.env.BETTER_AUTH_URL || "http://localhost:3000";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return json(401, "Silakan masuk terlebih dahulu.");

  const { id } = await params;
  const resume = await getResume(session.user.id, id);
  if (!resume) return json(404, "CV tidak ditemukan.");

  if (!rateLimit(`pdf:${session.user.id}`, 10, 60_000)) return json(429, "Terlalu banyak permintaan PDF. Tunggu sebentar.");

  try {
    const pdf = await renderPdf(`${renderOrigin()}/cv/${encodeURIComponent(id)}/print`, request.headers.get("cookie") ?? "");
    const fileName = pdfFileName(resume.content.personal.fullName, new Date());
    const asciiName = fileName.replace(/[^\x20-\x7e]/g, "_");
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF export failed", error);
    return json(500, error instanceof Error ? error.message : "Gagal membuat PDF.");
  }
}
