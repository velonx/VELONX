/**
 * Whether a banner targeted at `prefixes` should show on `pathname`.
 * An empty list targets every page; "/events" matches "/events" and "/events/123" but not "/eventsx".
 */
export function matchesPath(prefixes: string[], pathname: string): boolean {
  if (prefixes.length === 0) return true;
  return prefixes.some((p) => {
    if (p === "/") return pathname === "/";
    const prefix = p.endsWith("/") ? p.slice(0, -1) : p;
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}
