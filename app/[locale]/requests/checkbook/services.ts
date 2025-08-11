"use client";

import type { TCheckbookFormValues, TCheckbookResponse, TCheckbookValues } from "./types";
import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import { throwApiError } from "@/app/helpers/handleApiError";

/**
 * Fetch all checkbook requests (GET), with optional pagination & search.
 */
export async function getCheckbookRequests(
  page: number,
  limit: number,
  searchTerm: string = "",
  searchBy: string = ""
): Promise<TCheckbookResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${baseUrl}/checkbookrequests`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (searchTerm) url.searchParams.set("searchTerm", searchTerm);
  if (searchBy) url.searchParams.set("searchBy", searchBy);

  const init = (bearer?: string): RequestInit => ({
    method: "GET",
    headers: {
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    cache: "no-store",
  });

  let response = await fetch(url.toString(), init(token));

  // If unauthorized, refresh once and retry
  if (response.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url.toString(), init(token));
    } catch {
      // fall through to shared error handling
    }
  }

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch checkbook requests.");
  }

  return response.json() as Promise<TCheckbookResponse>;
}

/**
 * Creates a new checkbook request (POST) with the required body fields.
 */
export async function createCheckbookRequest(
  values: TCheckbookFormValues
): Promise<TCheckbookValues> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const payload = {
    fullName: values.fullName,
    address: values.address,
    accountNumber: values.accountNumber,
    representativeId: values.representativeId,
    branch: values.branch,
    date: values.date,
    bookContaining: values.bookContaining,
  };

  const url = `${baseUrl}/checkbookrequests`;

  const init = (bearer?: string): RequestInit => ({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let response = await fetch(url, init(token));

  if (response.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(response, "Failed to create checkbook.");
  }

  return (await response.json()) as TCheckbookValues;
}

export async function getCheckbookRequestById(
  id: string | number
): Promise<TCheckbookValues> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${baseUrl}/checkbookrequests/${id}`;

  const init = (bearer?: string): RequestInit => ({
    method: "GET",
    headers: {
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    cache: "no-store",
  });

  let response = await fetch(url, init(token));

  if (response.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(response, `Failed to fetch checkbook request by ID ${id}.`);
  }

  const data = (await response.json()) as TCheckbookValues;
  return data;
}

/**
 * Updates a checkbook request (PUT) with all the data fields.
 */
export async function updateCheckBookById(
  id: string | number,
  values: TCheckbookFormValues
): Promise<TCheckbookValues> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const payload = {
    fullName: values.fullName,
    address: values.address,
    accountNumber: values.accountNumber,
    representativeId: values.representativeId,
    branch: values.branch,
    date: values.date,
    bookContaining: values.bookContaining,
  };

  const url = `${baseUrl}/checkbookrequests/${id}`;

  const init = (bearer?: string): RequestInit => ({
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let response = await fetch(url, init(token));

  if (response.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(response, `Failed to update checkbook request with ID ${id}.`);
  }

  const responseData = (await response.json()) as TCheckbookValues;
  return responseData;
}
