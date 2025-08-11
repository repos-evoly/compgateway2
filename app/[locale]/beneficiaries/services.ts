"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import { throwApiError } from "@/app/helpers/handleApiError";
import {
  BeneficiaryPayload,
  BeneficiaryResponse,
  BeneficiariesApiResponse,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";

/**
 * POST /beneficiaries
 * Create a new beneficiary
 */
export async function createBeneficiary(
  payload: BeneficiaryPayload
): Promise<BeneficiaryResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/beneficiaries`;

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
    await throwApiError(res, "Failed to create beneficiary.");
  }

  const data = (await res.json()) as BeneficiaryResponse;
  return data;
}

/**
 * GET /beneficiaries
 * Get all beneficiaries with pagination and search
 */
export async function getBeneficiaries(
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<BeneficiariesApiResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${BASE_URL}/beneficiaries`);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());
  if (searchTerm) {
    url.searchParams.set("search", searchTerm);
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
    await throwApiError(res, "Failed to fetch beneficiaries.");
  }

  const data = await res.json();

  // If API returns a plain array, wrap it to the expected paginated structure
  if (Array.isArray(data)) {
    return {
      data,
      page,
      limit,
      totalPages: 1,
      totalRecords: data.length,
    } as BeneficiariesApiResponse;
  }

  return data as BeneficiariesApiResponse;
}

/**
 * GET /beneficiaries/{id}
 * Get beneficiary by ID
 */
export async function getBeneficiaryById(
  id: number
): Promise<BeneficiaryResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/beneficiaries/${id}`;

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
    await throwApiError(res, "Failed to fetch beneficiary.");
  }

  const data = (await res.json()) as BeneficiaryResponse;
  return data;
}

/**
 * PUT /beneficiaries/{id}
 * Update beneficiary by ID
 */
export async function updateBeneficiary(
  id: number,
  payload: BeneficiaryPayload
): Promise<BeneficiaryResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/beneficiaries/${id}`;

  const init = (bearer?: string): RequestInit => ({
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(payload),
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
    await throwApiError(res, "Failed to update beneficiary.");
  }

  const data = (await res.json()) as BeneficiaryResponse;
  return data;
}

/**
 * DELETE /beneficiaries/{id}
 * Delete beneficiary by ID
 */
export async function deleteBeneficiary(id: number): Promise<void> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/beneficiaries/${id}`;

  const init = (bearer?: string): RequestInit => ({
    method: "DELETE",
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
    await throwApiError(res, "Failed to delete beneficiary.");
  }

  return;
}
