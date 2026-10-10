import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResume } from "@/lib/resume/repository";
import { requireUser } from "@/lib/session";
import { PrintView } from "./print-view";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ autoprint?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await requireUser();
  const resume = await getResume(user.id, (await params).id);
  return { title: resume ? resume.content.personal.fullName || resume.title : "CV" };
}

export default async function PrintPage({ params, searchParams }: Props) {
  const user = await requireUser();
  const resume = await getResume(user.id, (await params).id);
  if (!resume) notFound();
  const { autoprint } = await searchParams;
  return <PrintView content={resume.content} language={resume.language} autoPrint={autoprint === "1"} />;
}
