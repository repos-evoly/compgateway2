export type ApiErrorDetails =
  | {
      message?: string | null;
      [key: string]: unknown;
    }
  | string
  | Array<unknown>
  | null;

export type ApiErrorEnvelope = {
  success?: boolean | string | number;
  status?: number | string;
  message?: string | null;
  details?: ApiErrorDetails;
  [key: string]: unknown;
};

const ERROR_FALLBACK = "حدث خطأ غير متوقع";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const coerceStatusCode = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const indicatesFailure = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value === false;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) && value === 0;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    return normalized === "false" || normalized === "0";
  }
  return false;
};

const extractDetailMessage = (
  details: ApiErrorDetails | undefined
): string | undefined => {
  if (!details) return undefined;

  if (typeof details === "string") {
    const trimmed = details.trim();
    return trimmed || undefined;
  }

  if (Array.isArray(details)) {
    for (const entry of details) {
      if (typeof entry === "string") {
        const trimmed = entry.trim();
        if (trimmed) return trimmed;
      } else if (isObject(entry) && typeof entry.message === "string") {
        const msg = entry.message.trim();
        if (msg) return msg;
      }
    }
    return undefined;
  }

  if (isObject(details) && typeof details.message === "string") {
    const trimmed = details.message.trim();
    if (trimmed) return trimmed;
  }

  return undefined;
};

const isErrorEnvelope = (value: unknown): value is ApiErrorEnvelope => {
  if (!isObject(value)) {
    return false;
  }

  if ("success" in value && indicatesFailure(value.success)) {
    return true;
  }

  if ("status" in value) {
    const statusCode = coerceStatusCode(value.status);
    if (statusCode !== undefined && statusCode >= 400) {
      return true;
    }
  }

  return false;
};

const extractMessage = (
  envelope: ApiErrorEnvelope | undefined,
  fallback?: string
): string => {
  if (!envelope) return fallback ?? ERROR_FALLBACK;

  const detailMessage = extractDetailMessage(envelope.details);
  if (detailMessage) {
    return detailMessage;
  }

  if (typeof envelope.message === "string" && envelope.message.trim()) {
    return envelope.message.trim();
  }

  const statusCode = coerceStatusCode(envelope.status);
  if (statusCode !== undefined && statusCode >= 400 && statusCode !== 200) {
    return `Request failed with status ${envelope.status}`;
  }

  return fallback ?? ERROR_FALLBACK;
};

export class ApiError extends Error {
  status?: number;
  details?: ApiErrorDetails;

  constructor(message: string, status?: number, details?: ApiErrorDetails) {
    super(message);
    this.name = "ApiError";
    if (status !== undefined) this.status = status;
    if (details !== undefined) this.details = details;
  }
}

export async function handleApiResponse<T = unknown>(
  response: Response,
  fallbackMessage?: string
): Promise<T> {
  const rawText = await response.clone().text();
  const trimmed = rawText.trim();

  let parsed: unknown;
  if (trimmed) {
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      parsed = undefined;
    }
  }

  const envelope = isErrorEnvelope(parsed) ? parsed : undefined;
  const shouldThrow = !response.ok || envelope !== undefined;

  if (shouldThrow) {
    const message = extractMessage(envelope, fallbackMessage);
    const status =
      envelope !== undefined
        ? coerceStatusCode(envelope.status)
        : response.ok
        ? undefined
        : response.status;
    const details = envelope?.details;
    throw new ApiError(message, status, details);
  }

  if (!trimmed) {
    return undefined as T;
  }

  if (parsed === undefined) {
    // Non-JSON payload but we read text; return raw text as-is
    return rawText as unknown as T;
  }

  return parsed as T;
}

export async function ensureApiSuccess(
  response: Response,
  fallbackMessage?: string
): Promise<void> {
  await handleApiResponse(response, fallbackMessage);
}
