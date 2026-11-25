export function resolveImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const base = apiBase.replace("/api", "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}