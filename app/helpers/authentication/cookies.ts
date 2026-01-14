// Lightweight helpers to read client-side cookies and permissions

export const getCookieValue = (key: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  try {
    const encodedKey = encodeURIComponent(key);
    const part = document.cookie
      .split("; ")
      .find(
        (row) => row.startsWith(`${encodedKey}=`) || row.startsWith(`${key}=`)
      );
    return part?.split("=")[1];
  } catch {
    return undefined;
  }
};

export const getPermissionsSetFromCookies = (): ReadonlySet<string> => {
  const raw = getCookieValue("permissions");
  if (!raw) return new Set<string>();
  try {
    const arr = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(arr) ? new Set<string>(arr as string[]) : new Set<string>();
  } catch {
    return new Set<string>();
  }
};

export const hasPermission = (perm: string): boolean =>
  getPermissionsSetFromCookies().has(perm);

