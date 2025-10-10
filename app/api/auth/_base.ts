const rawAuthBase = process.env.NEXT_PUBLIC_AUTH_API;

if (!rawAuthBase) {
  throw new Error("NEXT_PUBLIC_AUTH_API is not defined");
}

const normalizeAuthRoot = (): URL => {
  const url = new URL(rawAuthBase);
  const trimmedPath = url.pathname.replace(/\/+$/, "");

  const withoutAuthSuffix = trimmedPath
    .replace(/\/api\/auth$/i, "")
    .replace(/\/auth$/i, "")
    .replace(/\/api$/i, "");

  const rootPath = withoutAuthSuffix || "/";
  const href = `${url.origin}${rootPath.endsWith("/") ? rootPath : `${rootPath}/`}`;
  return new URL(href);
};

const authRoot = normalizeAuthRoot();

export const AUTH_API_BASE = rawAuthBase;

export const getAuthRoot = (): URL => authRoot;

export const resolveAuthAssetUrl = (rawPath: string): URL => {
  if (!rawPath) {
    throw new Error("Path is required");
  }

  const trimmed = rawPath.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    const candidate = new URL(trimmed);
    if (!candidate.href.startsWith(authRoot.href)) {
      throw new Error("URL outside of auth root");
    }
    return candidate;
  }

  const normalized = trimmed.replace(/^\/+/, "");
  return new URL(normalized, authRoot);
};
