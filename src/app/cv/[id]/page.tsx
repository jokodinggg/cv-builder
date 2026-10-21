import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorShell } from "@/components/editor/editor-shell";
import { getResume } from "@/lib/resume/repository";
import { requireUser } from "@/lib/session";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ copy?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await requireUser();
  const resume = await getResume(user.id, (await params).id);
  return { title: resume?.title ?? "CV" };
}

export default async function EditorPage({ params, searchParams }: Props) {
  const user = await requireUser();
  const resume = await getResume(user.id, (await params).id);
  if (!resume) notFound();
  const { copy } = await searchParams;
  return (
    <EditorShell
      key={resume.id}
      id={resume.id}
      title={resume.title}
      language={resume.language}
      content={resume.content}
      recovered={resume.recovered}
      languageCopy={copy === resume.language}
    />
  );
}
