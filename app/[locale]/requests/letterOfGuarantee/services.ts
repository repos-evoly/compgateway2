"use client";

import type {
  LetterOfGuaranteeApiItem,
  LetterOfGuaranteeApiResponse,
  TLetterOfGuarantee,
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
    searchTerm: "letterOfGuarantee",
    searchBy: "type",
    page: String(page),
    limit: String(limit),
  });
  if (searchTerm) params.append("searchTerm", searchTerm);
  if (searchBy) params.append("searchBy", searchBy);
  const qs = params.toString();
  return qs ? `${API_BASE}?${qs}` : API_BASE;
};

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
  const response = await fetch(
    buildListUrl(page, limit, searchTerm, searchBy),
    withCredentials({ method: "GET" })
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch letter of guarantee.");
  }

  return (await response.json()) as LetterOfGuaranteeApiResponse;
}

/**
 * Create (POST) a new letter of guarantee at /creditfacilities.
 * `type` should be "letterOfGuarantee".
 */
export async function addLetterOfGuarantee(
  payload: Omit<TLetterOfGuarantee, "id">
): Promise<LetterOfGuaranteeApiItem> {
  const body = {
    accountNumber: payload.accountNumber,
    date: payload.date,
    amount: payload.amount,
    purpose: payload.purpose,
    additionalInfo: payload.additionalInfo,
    curr: payload.curr,
    referenceNumber: payload.refferenceNumber, // API field name
    type: payload.type, // "letterOfGuarantee"
    status: payload.status,
    validUntil: payload.validUntil ?? null,
    letterOfGuarenteePct: payload.letterOfGuarenteePct ?? "",
  };

  const response = await fetch(API_BASE, jsonInit("POST", body));

  if (!response.ok) {
    await throwApiError(response, "Failed to create letter of guarantee.");
  }

  return (await response.json()) as LetterOfGuaranteeApiItem;
}

/**
 * Get a single letter of guarantee by ID: GET /creditfacilities/{id}
 */
export async function getLetterOfGuaranteeById(
  id: number
): Promise<LetterOfGuaranteeApiItem> {
  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({ method: "GET" })
  );

  if (!response.ok) {
    await throwApiError(response, `Failed to fetch letter of guarantee #${id}.`);
  }

  return (await response.json()) as LetterOfGuaranteeApiItem;
}

/**
 * Update an existing letter of guarantee by ID: PUT /creditfacilities/{id}
 */
export async function updateLetterOfGuaranteeById(
  id: number,
  payload: TLetterOfGuarantee
): Promise<LetterOfGuaranteeApiItem> {
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
    validUntil: payload.validUntil ?? null,
    letterOfGuarenteePct: payload.letterOfGuarenteePct ?? "",
  };

  const response = await fetch(`${API_BASE}/${id}`, jsonInit("PUT", body));

  if (!response.ok) {
    await throwApiError(response, `Failed to update letter of guarantee #${id}.`);
  }

  return (await response.json()) as LetterOfGuaranteeApiItem;
}
