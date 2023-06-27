export function toValidPathname(s: string): string {
  const result = s.trim().replace(/\W/g, "").substring(0, 24).toLowerCase();
  return result ? result : `collection${Math.ceil(Date.now() / 1000)}`;
}
