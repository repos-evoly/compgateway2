"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import { throwApiError } from "@/app/helpers/handleApiError";
import type {
  CheckAccountResponse,
  EconomicSectorGetResponse,
  TransferPayload,
  TransferResponse,
  TransfersApiResponse,
  TransfersCommision,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;

/**
 * POST /transfers
 */
export async function createTransfer(
  payload: TransferPayload
): Promise<TransferResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/transfers`;

  const init = (bearer?: string): RequestInit => ({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  // If unauthorized, refresh once and retry
  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through to error handling
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to create transfer.");
  }

  return (await res.json()) as TransferResponse;
}

/**
 * GET /transfers
 */
export async function getTransfers(
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<TransfersApiResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${BASE_URL}/transfers`);
  url.searchParams.append("page", String(page));
  url.searchParams.append("limit", String(limit));
  if (searchTerm) {
    url.searchParams.append("searchTerm", searchTerm);
  }

  const init = (bearer?: string): RequestInit => ({
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    cache: "no-store",
  });

  let res = await fetch(url.toString(), init(token));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url.toString(), init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to get transfers.");
  }

  return (await res.json()) as TransfersApiResponse;
}

/**
 * GET /transfers/{id}
 */
export async function getTransferById(id: number): Promise<TransferResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/transfers/${id}`;

  const init = (bearer?: string): RequestInit => ({
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to get transfer.");
  }

  return (await res.json()) as TransferResponse;
}

/**
 * GET /servicepackages/{servicePackageId}/categories/{transactionCategoryId}
 */
export async function getTransfersCommision(
  servicePackageId: number,
  transactionCategoryId: number
): Promise<TransfersCommision> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/servicepackages/${servicePackageId}/categories/${transactionCategoryId}`;

  const init = (bearer?: string): RequestInit => ({
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to create fetch commission.");
  }

  return (await res.json()) as TransfersCommision;
}

/**
 * GET /economic-sectors
 */
export async function getEconomicSectors(
  page: number,
  limit: number,
  searchTerm?: string
): Promise<EconomicSectorGetResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${BASE_URL}/economic-sectors`);
  url.searchParams.append("page", String(page));
  url.searchParams.append("limit", String(limit));
  if (searchTerm) {
    url.searchParams.append("searchTerm", searchTerm);
  }

  const init = (bearer?: string): RequestInit => ({
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    cache: "no-store",
  });

  let res = await fetch(url.toString(), init(token));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url.toString(), init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch economic sector.");
  }

  return (await res.json()) as EconomicSectorGetResponse;
}

/**
 * GET /transfers/accounts?account={account}
 */
export async function checkAccount(
  account: string
): Promise<CheckAccountResponse[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/transfers/accounts?account=${encodeURIComponent(
    account
  )}`;

  const init = (bearer?: string): RequestInit => ({
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to check account.");
  }

  return (await res.json()) as CheckAccountResponse[];
}
