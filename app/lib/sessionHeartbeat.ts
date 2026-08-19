export type SessionHeartbeatPayload = {
  success?: boolean;
  status?: number;
  code?: string;
  message?: string;
  sessionInvalid?: boolean;
  transient?: boolean;
  [key: string]: unknown;
};

export type SessionHeartbeatResult = "healthy" | "invalid" | "transient";

const CONFIRMED_INVALID_SESSION_CODES = new Set([
  "AUTH_SESSION_MISSING",
  "AUTH_SESSION_EXPIRED",
]);

export function isConfirmedSessionInvalid(
  payload: SessionHeartbeatPayload | null
): boolean {
  return (
    payload?.sessionInvalid === true ||
    (typeof payload?.code === "string" &&
      CONFIRMED_INVALID_SESSION_CODES.has(payload.code))
  );
}

export function classifySessionHeartbeat(
  httpStatus: number,
  payload: SessionHeartbeatPayload | null
): SessionHeartbeatResult {
  if (isConfirmedSessionInvalid(payload)) {
    return "invalid";
  }

  if (httpStatus >= 200 && httpStatus < 300 && payload?.success === true) {
    return "healthy";
  }

  return "transient";
}
