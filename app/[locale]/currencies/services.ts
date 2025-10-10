"use client";

import { handleApiResponse } from "@/app/helpers/apiResponse";
import type { CurrenciesResponse } from "./types";

const API_BASE = "/Companygw/api/currencies" as const;

export async function getCurrencies(
  page: number,
  limit: number,
  searchTerm: string = "",
  searchBy: string = ""
): Promise<CurrenciesResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (searchTerm) {
    params.set("searchTerm", searchTerm);
  }
  if (searchBy) {
    params.set("searchBy", searchBy);
  }
  const qs = params.toString();
  const url = qs ? `${API_BASE}?${qs}` : API_BASE;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return handleApiResponse<CurrenciesResponse>(
    response,
    "Failed to fetch currencies."
  );
}
