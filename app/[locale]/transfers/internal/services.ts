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

// Confirm (post) an existing transfer
// Post directly to external API with Bearer token from cookies
export async function postTransfer(id: number): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(
    buildUrl(`transfers/${id}/post`),
    withCredentials({ method: "POST" })
  );

  const text = await res.text();
  if (!res.ok) {
    // Try to extract message from body, otherwise throw generic
    try {
      const errJson = text ? (JSON.parse(text) as { message?: string }) : undefined;
      throw new Error(errJson?.message || "Failed to confirm transfer.");
    } catch {
      throw new Error(text || "Failed to confirm transfer.");
    }
  }

  if (!text) {
    return { success: true };
  }

  try {
    const data = JSON.parse(text) as unknown as { success?: boolean; message?: string; transfer?: unknown };
    if (data && typeof data === "object") {
      if (data.success === false) {
        return { success: false, message: data.message };
      }
      // Successful payloads may not include success=true; treat presence as success
      return { success: true, message: data.message };
    }
  } catch {
    // Non-JSON successful body; treat as success
  }
  return { success: true };
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
