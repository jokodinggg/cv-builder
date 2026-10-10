/** Headless Chrome may load only the app's own origin and inline data while printing a CV. */
export function isAllowedRequest(target: string, origin: string): boolean {
  if (target.startsWith("data:")) return true;
  try {
    return new URL(target).origin === origin;
  } catch {
    return false;
  }
}
