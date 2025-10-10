export type ApiErrorDetails = {
  message?: string | null;
  [key: string]: unknown;
} | null;

export type ApiErrorEnvelope = {
  success?: boolean;
  status?: number;
  message?: string | null;
  details?: ApiErrorDetails;
  [key: string]: unknown;
};

const ERROR_FALLBACK = "حدث خطأ غير متوقع";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isErrorEnvelope = (value: unknown): value is ApiErrorEnvelope =>
  isObject(value) && "success" in value && value.success === false;

const extractMessage = (
  envelope: ApiErrorEnvelope | undefined,
  fallback?: string
): string => {
  if (!envelope) return fallback ?? ERROR_FALLBACK;

  const detailMessage =
    (typeof envelope.details === "object" && envelope.details?.message) ||
    null;
  if (detailMessage && typeof detailMessage === "string" && detailMessage.trim()) {
    return detailMessage.trim();
  }

  if (typeof envelope.message === "string" && envelope.message.trim()) {
    return envelope.message.trim();
  }

  if (
    typeof envelope.status === "number" &&
    envelope.status >= 400 &&
    envelope.status !== 200
  ) {
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
    const status = envelope?.status ?? (response.ok ? undefined : response.status);
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
