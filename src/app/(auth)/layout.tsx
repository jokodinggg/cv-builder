import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { getUser } from "@/lib/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getUser()) redirect("/dashboard");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-10">
      <Logo />
      {children}
    </main>
  );
}
