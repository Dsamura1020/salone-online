const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizePlainText(value: string) {
  return value.replace(CONTROL_CHARS, "").trim();
}

export function normalizeEmail(email: string) {
  return sanitizePlainText(email).toLowerCase();
}

export function slugify(value: string) {
  const slug = sanitizePlainText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "item";
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
