import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();
  return <main className="p-6">Halo, {user.name}</main>;
}
