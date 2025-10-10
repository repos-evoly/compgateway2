"use client";

import { handleApiResponse } from "@/app/helpers/apiResponse";
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

  return handleApiResponse<TransferResponse>(
    response,
    "Failed to create transfer."
  );
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

  return handleApiResponse<TransfersApiResponse>(
    response,
    "Failed to get transfers."
  );
}

export async function getTransferById(
  id: number
): Promise<TransferResponse> {
  const response = await fetch(
    buildUrl(`transfers/${id}`),
    withCredentials()
  );

  return handleApiResponse<TransferResponse>(
    response,
    "Failed to get transfer."
  );
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

  return handleApiResponse<TransfersCommision>(
    response,
    "Failed to fetch commission."
  );
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

  return handleApiResponse<EconomicSectorGetResponse>(
    response,
    "Failed to fetch economic sectors."
  );
}

export async function checkAccount(
  account: string
): Promise<CheckAccountResponse[]> {
  const response = await fetch(
    buildUrl("transfers/accounts", { account }),
    withCredentials()
  );

  return handleApiResponse<CheckAccountResponse[]>(
    response,
    "Failed to check account."
  );
}
