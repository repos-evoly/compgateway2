"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import { throwApiError } from "@/app/helpers/handleApiError";
import type { CurrenciesResponse } from "./types";

/**
 * Fetch currencies from /currencies with optional pagination/search
 */
const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;
const shouldRefresh = (status: number) => status === 401 || status === 403;

export async function getCurrencies(
  page: number,
  limit: number,
  searchTerm: string = "",
  searchBy: string = ""
): Promise<CurrenciesResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${BASE_URL}/currencies`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (searchTerm) url.searchParams.set("searchTerm", searchTerm);
  if (searchBy) url.searchParams.set("searchBy", searchBy);

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  let res = await fetch(url.toString(), init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url.toString(), init(token));
    } catch {
      // fall through to shared error handling
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch currencies.");
  }

  const data = (await res.json()) as CurrenciesResponse;
  return data;
}
