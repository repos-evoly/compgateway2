"use client";

import type {
  ForeignTransferDetailResponse,
  ForeignTransfersListResponse,
  CreateForeignTransferPayload,
} from "./types";
import { throwApiError } from "@/app/helpers/handleApiError";
import type { TKycResponse } from "@/app/auth/register/types";

const API_BASE = "/Companygw/api/requests/foreign-transfers" as const;
const KYC_API_BASE = "/Companygw/api/companies/kyc" as const;

const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});

const buildListUrl = (
  page: number,
  limit: number,
  searchTerm: string,
  searchBy: string
): string => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (searchTerm) params.set("searchTerm", searchTerm);
  if (searchBy) params.set("searchBy", searchBy);
  const qs = params.toString();
  return qs ? `${API_BASE}?${qs}` : API_BASE;
};

const jsonInit = (method: "POST" | "PUT", payload: unknown): RequestInit =>
  withCredentials({
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

/**
 * GET /foreigntransfers => listing with pagination
 */
export async function getForeignTransfers(
  page: number,
  limit: number,
  searchTerm = "",
  searchBy = ""
): Promise<ForeignTransfersListResponse> {
  const response = await fetch(
    buildListUrl(page, limit, searchTerm, searchBy),
    withCredentials({ method: "GET" })
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch foreign transfers.");
  }

  return (await response.json()) as ForeignTransfersListResponse;
}

/**
 * GET /foreigntransfers/{id} => single detail
 */
export async function getForeignTransferById(
  id: string | number
): Promise<ForeignTransferDetailResponse> {
  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({ method: "GET" })
  );

  if (!response.ok) {
    await throwApiError(response, `Failed to fetch foreign transfer ${id}.`);
  }

  return (await response.json()) as ForeignTransferDetailResponse;
}

/**
 * POST /foreigntransfers => create a new foreign transfer
 */
export async function createForeignTransfer(
  payload: CreateForeignTransferPayload
): Promise<ForeignTransferDetailResponse> {
  const response = await fetch(API_BASE, jsonInit("POST", payload));

  if (!response.ok) {
    await throwApiError(response, "Failed to create foreign transfer.");
  }

  return (await response.json()) as ForeignTransferDetailResponse;
}

/**
 * PUT /foreigntransfers/{id} => update an existing foreign transfer
 */
export async function updateForeignTransfer(
  id: string | number,
  payload: CreateForeignTransferPayload
): Promise<ForeignTransferDetailResponse> {
  const response = await fetch(`${API_BASE}/${id}`, jsonInit("PUT", payload));

  if (!response.ok) {
    await throwApiError(response, "Failed to update foreign transfer.");
  }

  return (await response.json()) as ForeignTransferDetailResponse;
}

/**
 * GET /companies/kyc/{code}
 * Fetch KYC data by company code (6 digits after first 4 digits of account number)
 */
export async function getKycByCode(code: string): Promise<TKycResponse> {
  const response = await fetch(
    `${KYC_API_BASE}/${code}`,
    withCredentials({ method: "GET" })
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch KYC data");
  }

  return (await response.json()) as TKycResponse;
}
