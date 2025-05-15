"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler"; // Adjust path
import type { CurrenciesResponse } from "./types"; // Adjust path

/**
 * Fetch currencies from /currencies with optional pagination/search
 */
export async function getCurrencies(
  page: number,
  limit: number,
  searchTerm: string = "",
  searchBy: string = ""
): Promise<CurrenciesResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token");
  }

  const url = new URL(`${baseUrl}/currencies`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (searchTerm) url.searchParams.set("searchTerm", searchTerm);
  if (searchBy) url.searchParams.set("searchBy", searchBy);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch currencies. Status: ${res.status}`);
  }

  const data = (await res.json()) as CurrenciesResponse;
  return data;
}
