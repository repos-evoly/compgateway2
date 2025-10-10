const basePath = (process.env.NEXT_PUBLIC_APP_BASE_PATH ?? "").replace(/\/$/, "");
const proxyRoute = `${basePath || ""}/api/proxy/image`;
const authQrProxyRoute = `${basePath || ""}/api/auth/qr-image`;

/**
 * Build the proxy URL for upstream images so that the request goes through
 * our Next.js API route regardless of the configured basePath.
 */
export const buildImageProxyUrl = (rawPath: string): string => {
  const sanitized = rawPath.replace(/\\+/g, "/");
  return `${proxyRoute}?path=${encodeURIComponent(sanitized)}`;
};

export const buildAuthQrProxyUrl = (rawPath: string): string => {
  const sanitized = rawPath.replace(/\\+/g, "/");
  return `${authQrProxyRoute}?path=${encodeURIComponent(sanitized)}`;
};
