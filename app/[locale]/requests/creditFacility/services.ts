"use client";

import type {
  CreditFacilityApiItem,
  CreditFacilitiesApiResponse,
  TCreditFacility,
} from "./types";
import { handleApiResponse } from "@/app/helpers/apiResponse";

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

  return handleApiResponse<CreditFacilitiesApiResponse>(
    response,
    "Failed to fetch credit facilities."
  );
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

  return handleApiResponse<CreditFacilityApiItem>(
    response,
    "Failed to create credit facility."
  );
}

export async function getCreditFacilityById(
  id: number
): Promise<CreditFacilityApiItem> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  return handleApiResponse<CreditFacilityApiItem>(
    response,
    `Failed to fetch credit facility ID=${id}.`
  );
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

  return handleApiResponse<CreditFacilityApiItem>(
    response,
    `Failed to update credit facility ID=${id}.`
  );
}
