"use client";

import { handleApiResponse } from "@/app/helpers/apiResponse";
import type {
  CreateOnePayTransferPayload,
  OnePayAccount,
  OnePayInstitution,
  OnePayStatus,
  OnePayTransfer,
  OnePayTransfersResponse,
  OnePayValidationResponse,
  ValidateOnePayTransferPayload,
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

const normalizeStatus = (value: unknown): OnePayStatus => {
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
      throw new Error("The OnePay transfer response contains an invalid status.");
  }
};

const unwrapData = (value: unknown): unknown => {
  if (!isRecord(value)) return value;
  if ("transfer" in value) return value.transfer;
  if ("data" in value && !Array.isArray(value.data)) return value.data;
  return value;
};

const normalizeTransfer = (rawValue: unknown): OnePayTransfer => {
  const raw = unwrapData(rawValue);
  if (!isRecord(raw)) {
    throw new Error("Invalid OnePay transfer response.");
  }

  const id = asNumber(raw.id, Number.NaN);
  if (!Number.isFinite(id)) {
    throw new Error("The OnePay transfer response is missing its ID.");
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

const normalizeValidation = (rawValue: unknown): OnePayValidationResponse => {
  const raw = unwrapData(rawValue);
  if (!isRecord(raw)) {
    throw new Error("Invalid OnePay validation response.");
  }

  const validationToken = asString(raw.validationToken);
  if (!validationToken) {
    throw new Error("The OnePay validation response is missing its token.");
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

export async function getOnePayAccounts(): Promise<OnePayAccount[]> {
  const response = await fetch(
    buildUrl("onepay/accounts"),
    withCredentials()
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to load OnePay accounts."
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

export async function getOnePayInstitutions(
  language: "ar" | "en"
): Promise<OnePayInstitution[]> {
  const response = await fetch(
    buildUrl("onepay/institutions", { language }),
    withCredentials()
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to load OnePay institutions."
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

export async function getOnePayTransfers(
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<OnePayTransfersResponse> {
  const response = await fetch(
    buildUrl("onepay/transfers", { page, limit, searchTerm }),
    withCredentials()
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to load OnePay transfers."
  );
  if (!isRecord(raw)) {
    throw new Error("Invalid OnePay transfers response.");
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

export async function getOnePayTransferById(
  id: number
): Promise<OnePayTransfer> {
  const response = await fetch(
    buildUrl(`onepay/transfers/${id}`),
    withCredentials()
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to load the OnePay transfer."
  );
  return normalizeTransfer(raw);
}

export async function validateOnePayTransfer(
  payload: ValidateOnePayTransferPayload
): Promise<OnePayValidationResponse> {
  const response = await fetch(
    buildUrl("onepay/transfers/validate"),
    jsonRequest("POST", payload)
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "OnePay could not validate the transfer."
  );
  return normalizeValidation(raw);
}

export async function createOnePayTransfer(
  payload: CreateOnePayTransferPayload
): Promise<OnePayTransfer> {
  const response = await fetch(
    buildUrl("onepay/transfers"),
    jsonRequest("POST", payload)
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to create the OnePay transfer."
  );
  return normalizeTransfer(raw);
}

export async function approveOnePayTransfer(
  id: number
): Promise<OnePayTransfer> {
  const response = await fetch(
    buildUrl(`onepay/transfers/${id}/approve`),
    jsonRequest("POST")
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to approve and execute the OnePay transfer."
  );
  return normalizeTransfer(raw);
}

export async function refreshOnePayTransferStatus(
  id: number
): Promise<OnePayTransfer> {
  const response = await fetch(
    buildUrl(`onepay/transfers/${id}/refresh-status`),
    jsonRequest("POST")
  );
  const raw = await handleApiResponse<unknown>(
    response,
    "Failed to refresh the OnePay transfer status."
  );
  return normalizeTransfer(raw);
}
