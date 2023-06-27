export function toValidPathname(s: string): string {
  return s.trim().replace(/[^\w]/g, "").substring(0, 24).toLowerCase();
}
