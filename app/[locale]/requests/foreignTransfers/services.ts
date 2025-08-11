"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import type {
  ForeignTransferDetailResponse,
  ForeignTransfersListResponse,
  CreateForeignTransferPayload,
} from "./types";
import { throwApiError } from "@/app/helpers/handleApiError";
import type { TKycResponse } from "@/app/auth/register/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";

const shouldRefresh = (s: number) => s === 401 || s === 403;

/**
 * GET /foreigntransfers => listing with pagination
 */
export async function getForeignTransfers(
  page: number,
  limit: number,
  searchTerm = "",
  searchBy = ""
): Promise<ForeignTransfersListResponse> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = new URL(`${BASE_URL}/foreigntransfers`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (searchTerm) url.searchParams.set("searchTerm", searchTerm);
  if (searchBy) url.searchParams.set("searchBy", searchBy);

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: { Authorization: `Bearer ${bearer}` },
    cache: "no-store",
  });

  let res = await fetch(url.toString(), init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url.toString(), init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch foreign transfers.");
  }

  const data = (await res.json()) as ForeignTransfersListResponse;
  return data;
}

/**
 * GET /foreigntransfers/{id} => single detail
 */
export async function getForeignTransferById(
  id: string | number
): Promise<ForeignTransferDetailResponse> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = `${BASE_URL}/foreigntransfers/${id}`;

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: { Authorization: `Bearer ${bearer}` },
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, `Failed to fetch foreign transfer ${id}.`);
  }

  const data = (await res.json()) as ForeignTransferDetailResponse;
  return data;
}

/**
 * POST /foreigntransfers => create a new foreign transfer
 */
export async function createForeignTransfer(
  payload: CreateForeignTransferPayload
): Promise<ForeignTransferDetailResponse> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = `${BASE_URL}/foreigntransfers`;

  const init = (bearer: string): RequestInit => ({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to create foreign transfer.");
  }

  const data = (await res.json()) as ForeignTransferDetailResponse;
  return data;
}

/**
 * PUT /foreigntransfers/{id} => update an existing foreign transfer
 */
export async function updateForeignTransfer(
  id: string | number,
  payload: CreateForeignTransferPayload
): Promise<ForeignTransferDetailResponse> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = `${BASE_URL}/foreigntransfers/${id}`;

  const init = (bearer: string): RequestInit => ({
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to update foreign transfer.");
  }

  const data = (await res.json()) as ForeignTransferDetailResponse;
  return data;
}

/**
 * GET /companies/kyc/{code}
 * Fetch KYC data by company code (6 digits after first 4 digits of account number)
 */
export async function getKycByCode(code: string): Promise<TKycResponse> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = `${BASE_URL}/companies/kyc/${code}`;

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: { Authorization: `Bearer ${bearer}` },
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch KYC data");
  }

  return (await res.json()) as TKycResponse;
}
