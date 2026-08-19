"use client";

import { handleApiResponse } from "@/app/helpers/apiResponse";
import type {
  CreateLyPayTransferPayload,
  LyPayAccount,
  LyPayInstitution,
  LyPayStatus,
  LyPayTransfer,
  LyPayTransfersResponse,
  LyPayValidationResponse,
  ValidateLyPayTransferPayload,
} from "./types";

const API_ROOT = "/Companygw/api" as const;

const buildUrl = (
  path: string,
  params?: Record<string, string | number | undefined>
): string => {
  const normalized = path.replace(/^\/+/, "");
  const base = `${API_ROOT}/${normalized}`;
  if (!params) return base;

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `${base}?${query}` : base;
};

const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});

const jsonRequest = (method: string, body?: unknown): RequestInit =>
  withCredentials({
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const asNullableString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const asBoolean = (value: unknown): boolean => value === true;

const normalizeStatus = (value: unknown): LyPayStatus => {
  const normalized = asString(value)
    .replace(/[\s_-]/g, "")
    .toLowerCase();

  switch (normalized) {
    case "pendingapproval":
      return "pendingApproval";
    case "pendingproviderresponse":
      return "pendingProviderResponse";
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    case "unknown":
      return "unknown";
    default:
      throw new Error("The LY Pay transfer response contains an invalid status.");
  }
};

const unwrapData = (value: unknown): unknown => {
  if (!isRecord(value)) return value;
  if ("transfer" in value) return value.transfer;
  if ("data" in value && !Array.isArray(value.data)) return value.data;
  return value;
};

const normalizeTransfer = (rawValue: unknown): LyPayTransfer => {
  const raw = unwrapData(rawValue);
  if (!isRecord(raw)) {
    throw new Error("Invalid LY Pay transfer response.");
  }

  const id = asNumber(raw.id, Number.NaN);
  if (!Number.isFinite(id)) {
    throw new Error("The LY Pay transfer response is missing its ID.");
  }

  return {
    id,
    referenceNo: asString(raw.referenceNo, String(id)),
    fromAccount: asString(raw.fromAccount),
    fromAccountName: asString(raw.fromAccountName),
    toInstitutionId: asString(raw.toInstitutionId),
    toInstitutionName: asString(raw.toInstitutionName),
    toAccount: asString(raw.toAccount),
    toAccountName: asString(raw.toAccountName),
    amount: asNumber(raw.amount),
    currency: asString(raw.currency),
    description: asString(raw.description),
    status: normalizeStatus(raw.status),
    createdByName: asString(raw.createdByName),
    approvedByName: asNullableString(raw.approvedByName),
    createdAt: asString(raw.createdAt),
    validatedAt: asNullableString(raw.validatedAt),
    executedAt: asNullableString(raw.executedAt),
    completedAt: asNullableString(raw.completedAt),
    statusCheckAttempts: asNumber(raw.statusCheckAttempts),
    lastStatusCheckedAt: asNullableString(raw.lastStatusCheckedAt),
    providerTransactionStatus: asNullableString(raw.providerTransactionStatus),
    providerReturnMessageCode: asNullableString(raw.providerReturnMessageCode),
    providerReturnMessage: asNullableString(raw.providerReturnMessage),
    bankReferenceNo: asNullableString(raw.bankReferenceNo),
    canApprove: asBoolean(raw.canApprove),
  };
};

const normalizeValidation = (rawValue: unknown): LyPayValidationResponse => {
  const raw = unwrapData(rawValue);
  if (!isRecord(raw)) {
    throw new Error("Invalid LY Pay validation response.");
  }

  const validationToken = asString(raw.validationToken);
  if (!validationToken) {
    throw new Error("The LY Pay validation response is missing its token.");
  }

  return {
    validationToken,
    expiresAt: asString(raw.expiresAt),
    toAccountName: asString(raw.toAccountName),
    institutionName: asString(raw.institutionName),
    fromAccount: asString(raw.fromAccount),
    toAccount: asString(raw.toAccount),
    amount: asNumber(raw.amount),
    currency: asString(raw.currency),
    description: asString(raw.description),
  };
};

export async function getLyPayAccounts(): Promise<LyPayAccount[]> {
  const response = await fetch(
    buildUrl("lypay/accounts"),
    withCredentials()
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to load LY Pay accounts."
  );
  const values = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.data)
      ? raw.data
      : [];

  return values
    .filter(isRecord)
    .map((account) => ({
      accountNumber: asString(account.accountNumber),
      accountName: asString(account.accountName),
      currency: asString(account.currency),
      availableBalance: asNumber(account.availableBalance),
    }))
    .filter((account) => Boolean(account.accountNumber));
}

export async function getLyPayInstitutions(
  language: "ar" | "en"
): Promise<LyPayInstitution[]> {
  const response = await fetch(
    buildUrl("lypay/institutions", { language }),
    withCredentials()
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to load LY Pay institutions."
  );
  const values = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.data)
      ? raw.data
      : [];

  return values
    .filter(isRecord)
    .map((institution) => ({
      institutionId: asString(institution.institutionId),
      reference: asString(institution.reference),
      shortName: asString(institution.shortName),
      fullName: asString(institution.fullName),
    }))
    .filter((institution) => Boolean(institution.institutionId));
}

export async function getLyPayTransfers(
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<LyPayTransfersResponse> {
  const response = await fetch(
    buildUrl("lypay/transfers", { page, limit, searchTerm }),
    withCredentials()
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to load LY Pay transfers."
  );
  if (!isRecord(raw)) {
    throw new Error("Invalid LY Pay transfers response.");
  }

  const data = Array.isArray(raw.data)
    ? raw.data.map(normalizeTransfer)
    : [];

  return {
    data,
    page: asNumber(raw.page, page),
    limit: asNumber(raw.limit, limit),
    totalPages: Math.max(1, asNumber(raw.totalPages, 1)),
    totalRecords: asNumber(raw.totalRecords, data.length),
  };
}

export async function getLyPayTransferById(
  id: number
): Promise<LyPayTransfer> {
  const response = await fetch(
    buildUrl(`lypay/transfers/${id}`),
    withCredentials()
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to load the LY Pay transfer."
  );
  return normalizeTransfer(raw);
}

export async function validateLyPayTransfer(
  payload: ValidateLyPayTransferPayload
): Promise<LyPayValidationResponse> {
  const response = await fetch(
    buildUrl("lypay/transfers/validate"),
    jsonRequest("POST", payload)
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "LY Pay could not validate the transfer."
  );
  return normalizeValidation(raw);
}

export async function createLyPayTransfer(
  payload: CreateLyPayTransferPayload
): Promise<LyPayTransfer> {
  const response = await fetch(
    buildUrl("lypay/transfers"),
    jsonRequest("POST", payload)
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to create the LY Pay transfer."
  );
  return normalizeTransfer(raw);
}

export async function approveLyPayTransfer(
  id: number
): Promise<LyPayTransfer> {
  const response = await fetch(
    buildUrl(`lypay/transfers/${id}/approve`),
    jsonRequest("POST")
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to approve and execute the LY Pay transfer."
  );
  return normalizeTransfer(raw);
}

export async function refreshLyPayTransferStatus(
  id: number
): Promise<LyPayTransfer> {
  const response = await fetch(
    buildUrl(`lypay/transfers/${id}/refresh-status`),
    jsonRequest("POST")
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to refresh the LY Pay transfer status."
  );
  return normalizeTransfer(raw);
}
