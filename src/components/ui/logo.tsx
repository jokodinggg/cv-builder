import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink">
      <span className="grid size-8 place-items-center rounded-lg bg-brand text-sm text-white">CV</span>
      CV Builder
    </Link>
  );
}
