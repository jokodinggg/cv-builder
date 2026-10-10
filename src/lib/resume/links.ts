import type { Link, LinkType } from "./schema";

export const LINK_TYPES: Record<LinkType, { label: string; placeholder: string }> = {
  email: { label: "Email", placeholder: "nama@email.com" },
  phone: { label: "Telepon", placeholder: "+62 812 3456 7890" },
  whatsapp: { label: "WhatsApp", placeholder: "+6281234567890" },
  linkedin: { label: "LinkedIn", placeholder: "linkedin.com/in/username" },
  github: { label: "GitHub", placeholder: "github.com/username" },
  website: { label: "Website", placeholder: "namaanda.dev" },
  instagram: { label: "Instagram", placeholder: "username" },
  x: { label: "X / Twitter", placeholder: "username" },
  youtube: { label: "YouTube", placeholder: "youtube.com/@channel" },
  other: { label: "Lainnya", placeholder: "https://…" },
};

const HANDLE_HOSTS: Partial<Record<LinkType, string>> = { instagram: "instagram.com", x: "x.com" };

const digits = (value: string) => value.replace(/[^0-9]/g, "");

function toWebUrl(value: string): string | null {
  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    return url.protocol === "https:" || url.protocol === "http:" ? withProtocol : null;
  } catch {
    return null;
  }
}

/** Safe href for a link, or null when the value is empty or uses a disallowed scheme. */
export function linkHref(link: Link): string | null {
  const value = link.value.trim();
  if (!value) return null;
  switch (link.type) {
    case "email":
      return value.includes("@") && !/\s/.test(value) ? `mailto:${value}` : null;
    case "phone": {
      const number = digits(value);
      return number ? `tel:${value.trim().startsWith("+") ? "+" : ""}${number}` : null;
    }
    case "whatsapp": {
      const number = digits(value).replace(/^0/, "62");
      return number ? `https://wa.me/${number}` : null;
    }
    case "instagram":
    case "x": {
      const handle = value.replace(/^@/, "");
      if (/^[\w.]+$/.test(handle)) return `https://${HANDLE_HOSTS[link.type]}/${handle}`;
      return toWebUrl(value);
    }
    default:
      return toWebUrl(value);
  }
}

/** Short text shown on the CV. */
export function linkDisplay(link: Link): string {
  const value = link.value.trim();
  if ((link.type === "instagram" || link.type === "x") && /^@?[\w.]+$/.test(value)) return `@${value.replace(/^@/, "")}`;
  if (link.type === "email" || link.type === "phone" || link.type === "whatsapp") return value;
  return value.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}
