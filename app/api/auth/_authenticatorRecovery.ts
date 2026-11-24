import { deviceCookieConfig } from "@/app/api/_lib/authCookies";

export const recoveryBrowserCookie = "authenticatorRecoveryBrowser";
export const recoveryProofCookie = "authenticatorRecoveryProof";
export const recoveryBrowserHeader = "X-Authenticator-Recovery-Browser";
export const recoveryCookieConfig = {
  ...deviceCookieConfig,
  sameSite: "strict" as const,
  path: `${deviceCookieConfig.path}/api/auth`,
};
export const isRecoveryBrowserKey = (value: unknown): value is string =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
