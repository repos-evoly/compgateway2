"use client";

import { throwApiError } from "@/app/helpers/handleApiError";
import type {
  CheckAccountResponse,
  EconomicSectorGetResponse,
  TransferPayload,
  TransferResponse,
  TransfersApiResponse,
  TransfersCommision,
} from "./types";

const API_ROOT = "/Companygw/api" as const;

const buildUrl = (
  path: string,
  params?: Record<string, string | number | undefined>
): string => {
  const normalized = path.replace(/^\/+/, "");
  const base = `${API_ROOT}/${normalized}`;
  if (!params) {
    return base;
  }
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
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
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

export async function createTransfer(
  payload: TransferPayload
): Promise<TransferResponse> {
  const response = await fetch(
    buildUrl("transfers"),
    jsonRequest("POST", payload)
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to create transfer.");
  }

  return (await response.json()) as TransferResponse;
}

export async function getTransfers(
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<TransfersApiResponse> {
  const response = await fetch(
    buildUrl("transfers", { page, limit, searchTerm }),
    withCredentials()
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to get transfers.");
  }

  return (await response.json()) as TransfersApiResponse;
}

export async function getTransferById(
  id: number
): Promise<TransferResponse> {
  const response = await fetch(
    buildUrl(`transfers/${id}`),
    withCredentials()
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to get transfer.");
  }

  return (await response.json()) as TransferResponse;
}

export async function getTransfersCommision(
  servicePackageId: number,
  transactionCategoryId: number
): Promise<TransfersCommision> {
  const response = await fetch(
    buildUrl(
      `servicepackages/${servicePackageId}/categories/${transactionCategoryId}`
    ),
    withCredentials()
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch commission.");
  }

  return (await response.json()) as TransfersCommision;
}

export async function getEconomicSectors(
  page: number,
  limit: number,
  searchTerm?: string
): Promise<EconomicSectorGetResponse> {
  const response = await fetch(
    buildUrl("economic-sectors", { page, limit, searchTerm }),
    withCredentials()
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch economic sectors.");
  }

  return (await response.json()) as EconomicSectorGetResponse;
}

export async function checkAccount(
  account: string
): Promise<CheckAccountResponse[]> {
  const response = await fetch(
    buildUrl("transfers/accounts", { account }),
    withCredentials()
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to check account.");
  }

  return (await response.json()) as CheckAccountResponse[];
}
