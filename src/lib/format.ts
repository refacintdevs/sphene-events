export function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString("en-NG")}`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength).trimEnd()}…`;
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return (words[0]![0] ?? "?").toUpperCase();
  return `${(words[0]![0] ?? "?").toUpperCase()}${(words[words.length - 1]![0] ?? "?").toUpperCase()}`;
}
