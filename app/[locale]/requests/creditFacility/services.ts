"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import type {
  CreditFacilityApiItem,
  CreditFacilitiesApiResponse,
  TCreditFacility,
} from "./types";
import { throwApiError } from "@/app/helpers/handleApiError";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

const init = (
  method: "GET" | "POST" | "PUT",
  bearer?: string,
  body?: unknown
): RequestInit => ({
  method,
  headers: {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
  },
  ...(body ? { body: JSON.stringify(body) } : {}),
  cache: "no-store",
});

/** Fetch (GET) credit facilities with pagination & search. */
export async function getCreditFacilities(
  page = 1,
  limit = 10,
  searchTerm = "",
  searchBy = ""
): Promise<CreditFacilitiesApiResponse> {
  if (!BASE_API) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${BASE_API}/creditfacilities`);
  // Always scope to credit facilities by type, as per your original code
  url.searchParams.set("searchTerm", "creditFacility");
  url.searchParams.set("searchBy", "type");
  url.searchParams.append("page", String(page));
  url.searchParams.append("limit", String(limit));
  if (searchTerm) url.searchParams.append("searchTerm", searchTerm);
  if (searchBy) url.searchParams.append("searchBy", searchBy);

  let res = await fetch(url.toString(), init("GET", token));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url.toString(), init("GET", token));
    } catch {
      // fall through to shared error handler
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch credit facilities.");
  }

  return (await res.json()) as CreditFacilitiesApiResponse;
}

export async function addCreditFacility(
  payload: Omit<TCreditFacility, "id">
): Promise<CreditFacilityApiItem> {
  if (!BASE_API) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_API}/creditfacilities`;
  const body = {
    accountNumber: payload.accountNumber,
    date: payload.date,
    amount: payload.amount,
    purpose: payload.purpose,
    additionalInfo: payload.additionalInfo,
    curr: payload.curr,
    referenceNumber: payload.refferenceNumber, // API expects this name
    type: payload.type,
  };

  let res = await fetch(url, init("POST", token, body));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init("POST", token, body));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to create credit facility.");
  }

  return (await res.json()) as CreditFacilityApiItem;
}

export async function getCreditFacilityById(
  id: number
): Promise<CreditFacilityApiItem> {
  if (!BASE_API) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_API}/creditfacilities/${id}`;

  let res = await fetch(url, init("GET", token));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init("GET", token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, `Failed to fetch credit facility ID=${id}.`);
  }

  return (await res.json()) as CreditFacilityApiItem;
}

export async function updateCreditFacilityById(
  id: number,
  payload: TCreditFacility
): Promise<CreditFacilityApiItem> {
  if (!BASE_API) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_API}/creditfacilities/${id}`;
  const body = {
    accountNumber: payload.accountNumber,
    date: payload.date,
    amount: payload.amount,
    purpose: payload.purpose,
    additionalInfo: payload.additionalInfo,
    curr: payload.curr,
    referenceNumber: payload.refferenceNumber, // API expects this name
    type: payload.type,
    status: payload.status,
  };

  let res = await fetch(url, init("PUT", token, body));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init("PUT", token, body));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, `Failed to update credit facility ID=${id}.`);
  }

  return (await res.json()) as CreditFacilityApiItem;
}
