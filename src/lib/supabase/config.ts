export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  return raw.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
}

export function hasSupabaseConfig(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(
    url &&
      key &&
      url.startsWith("https://") &&
      !url.includes("your-new-project-ref")
  );
}

export function isAllowedAdminEmail(email?: string | null): boolean {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.trim();
  if (!raw) return true; // Any user registered in this project's Auth is allowed unless restricted
  if (!email) return false;
  const allowlist = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.length === 0 || allowlist.includes(email.toLowerCase());
}
