"use client";

import type {
  LetterOfGuaranteeApiItem,
  LetterOfGuaranteeApiResponse,
  TLetterOfGuarantee,
} from "./types";
import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
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

/**
 * Fetch (GET) letter of guarantees with pagination & search.
 * Always includes `searchTerm=letterOfGuarantee&searchBy=type` so the API returns only type="letterOfGuarantee".
 * If user supplies searchTerm/searchBy, they are appended as additional filters.
 */
export async function getLetterOfGuarantees(
  page = 1,
  limit = 10,
  searchTerm = "",
  searchBy = ""
): Promise<LetterOfGuaranteeApiResponse> {
  if (!BASE_API) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${BASE_API}/creditfacilities`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  // Always enforce type filter
  url.searchParams.set("searchTerm", "letterOfGuarantee");
  url.searchParams.set("searchBy", "type");
  // If user also searches, add extra params
  if (searchTerm) url.searchParams.append("searchTerm", searchTerm);
  if (searchBy) url.searchParams.append("searchBy", searchBy);

  let res = await fetch(url.toString(), init("GET", token));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url.toString(), init("GET", token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch letter of guarantee.");
  }

  return (await res.json()) as LetterOfGuaranteeApiResponse;
}

/**
 * Create (POST) a new letter of guarantee at /creditfacilities.
 * `type` should be "letterOfGuarantee".
 */
export async function addLetterOfGuarantee(
  payload: Omit<TLetterOfGuarantee, "id">
): Promise<LetterOfGuaranteeApiItem> {
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
    referenceNumber: payload.refferenceNumber, // API field name
    type: payload.type, // "letterOfGuarantee"
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
    await throwApiError(res, "Failed to create letter of guarantee.");
  }

  return (await res.json()) as LetterOfGuaranteeApiItem;
}

/**
 * Get a single letter of guarantee by ID: GET /creditfacilities/{id}
 */
export async function getLetterOfGuaranteeById(
  id: number
): Promise<LetterOfGuaranteeApiItem> {
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
    await throwApiError(res, `Failed to fetch letter of guarantee #${id}.`);
  }

  return (await res.json()) as LetterOfGuaranteeApiItem;
}

/**
 * Update an existing letter of guarantee by ID: PUT /creditfacilities/{id}
 */
export async function updateLetterOfGuaranteeById(
  id: number,
  payload: TLetterOfGuarantee
): Promise<LetterOfGuaranteeApiItem> {
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
    referenceNumber: payload.refferenceNumber, // API field name
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
    await throwApiError(res, `Failed to update letter of guarantee ID=${id}.`);
  }

  return (await res.json()) as LetterOfGuaranteeApiItem;
}
