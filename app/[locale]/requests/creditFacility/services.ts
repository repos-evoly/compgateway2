"use client";

import type {
  CreditFacilityApiItem,
  CreditFacilitiesApiResponse,
  TCreditFacility,
} from "./types";
import { throwApiError } from "@/app/helpers/handleApiError";

const API_BASE = "/Companygw/api/requests/credit-facility" as const;

const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});

const jsonInit = (method: "POST" | "PUT", body: unknown): RequestInit =>
  withCredentials({
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

const buildListUrl = (
  page = 1,
  limit = 10,
  searchTerm = "",
  searchBy = ""
): string => {
  const params = new URLSearchParams({
    searchTerm: "creditFacility",
    searchBy: "type",
    page: String(page),
    limit: String(limit),
  });
  if (searchTerm) params.append("searchTerm", searchTerm);
  if (searchBy) params.append("searchBy", searchBy);
  const qs = params.toString();
  return qs ? `${API_BASE}?${qs}` : API_BASE;
};

/** Fetch (GET) credit facilities with pagination & search. */
export async function getCreditFacilities(
  page = 1,
  limit = 10,
  searchTerm = "",
  searchBy = ""
): Promise<CreditFacilitiesApiResponse> {
  const response = await fetch(
    buildListUrl(page, limit, searchTerm, searchBy),
    withCredentials({ method: "GET" })
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch credit facilities.");
  }

  return (await response.json()) as CreditFacilitiesApiResponse;
}

export async function addCreditFacility(
  payload: Omit<TCreditFacility, "id">
): Promise<CreditFacilityApiItem> {
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

  const response = await fetch(API_BASE, jsonInit("POST", body));

  if (!response.ok) {
    await throwApiError(response, "Failed to create credit facility.");
  }

  return (await response.json()) as CreditFacilityApiItem;
}

export async function getCreditFacilityById(
  id: number
): Promise<CreditFacilityApiItem> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    await throwApiError(response, `Failed to fetch credit facility ID=${id}.`);
  }

  return (await response.json()) as CreditFacilityApiItem;
}

export async function updateCreditFacilityById(
  id: number,
  payload: TCreditFacility
): Promise<CreditFacilityApiItem> {
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

  const response = await fetch(`${API_BASE}/${id}`, jsonInit("PUT", body));

  if (!response.ok) {
    await throwApiError(response, `Failed to update credit facility ID=${id}.`);
  }

  return (await response.json()) as CreditFacilityApiItem;
}
