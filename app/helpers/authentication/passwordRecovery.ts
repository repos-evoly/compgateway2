export type RecoveryVerification = { resetToken: string; expiresIn: number };

export class RecoveryError extends Error {
  constructor(public readonly code: string) { super(code); }
}

const baseUrl = () => "/Companygw/api/auth";

async function post(path: string, payload: object): Promise<Record<string, unknown>> {
  const base = baseUrl();
  if (!base) throw new RecoveryError("unavailable");
  const response = await fetch(`${base}/password-recovery/${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    cache: "no-store", credentials: "include", body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data || data.success === false) {
    throw new RecoveryError(typeof data?.code === "string" ? data.code : "unavailable");
  }
  return data;
}

export async function verifyPasswordRecovery(login: string, code: string): Promise<RecoveryVerification> {
  const data = await post("verify", { login: login.trim(), code: code.trim() });
  if (typeof data.resetToken !== "string" || !/^[0-9A-F]{64}$/.test(data.resetToken) ||
      typeof data.expiresIn !== "number" || data.expiresIn <= 0 || data.expiresIn > 300) {
    throw new RecoveryError("unavailable");
  }
  return { resetToken: data.resetToken, expiresIn: data.expiresIn };
}

export async function completePasswordRecovery(resetToken: string, password: string, confirmPassword: string): Promise<void> {
  const data = await post("complete", { resetToken, password, confirmPassword });
  if (data.success !== true) throw new RecoveryError("unavailable");
}
