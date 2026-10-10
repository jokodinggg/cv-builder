import { Logo } from "@/components/ui/logo";
import type { SessionUser } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

export function AppHeader({ user }: { user: SessionUser }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo href="/dashboard" />
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden truncate text-sm text-muted sm:inline">{user.email}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
