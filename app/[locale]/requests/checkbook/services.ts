"use client";

import type {
  TCheckbookFormValues,
  TCheckbookResponse,
  TCheckbookValues,
} from "./types";
import { handleApiResponse } from "@/app/helpers/apiResponse";

const API_BASE = "/Companygw/api/requests/checkbook" as const;

type SearchBy = string;

const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});

const buildQuery = (
  page: number,
  limit: number,
  searchTerm: string,
  searchBy: SearchBy
): string => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (searchTerm) params.set("searchTerm", searchTerm);
  if (searchBy) params.set("searchBy", searchBy);
  const qs = params.toString();
  return qs ? `${API_BASE}?${qs}` : API_BASE;
};

/**
 * Fetch all checkbook requests (GET), with optional pagination & search.
 */
export async function getCheckbookRequests(
  page: number,
  limit: number,
  searchTerm: string = "",
  searchBy: SearchBy = ""
): Promise<TCheckbookResponse> {
  const url = buildQuery(page, limit, searchTerm, searchBy);

  const response = await fetch(url, withCredentials({ method: "GET" }));

  return handleApiResponse<TCheckbookResponse>(
    response,
    "Failed to fetch checkbook requests."
  );
}

/**
 * Creates a new checkbook request (POST) with the required body fields.
 */
export async function createCheckbookRequest(
  values: TCheckbookFormValues
): Promise<TCheckbookValues> {
  const payload = {
    fullName: values.fullName,
    address: values.address,
    accountNumber: values.accountNumber,
    representativeId: values.representativeId,
    branch: values.branch,
    date: values.date,
    bookContaining: values.bookContaining,
  };

  const response = await fetch(
    API_BASE,
    withCredentials({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );

  return handleApiResponse<TCheckbookValues>(
    response,
    "Failed to create checkbook."
  );
}

export async function getCheckbookRequestById(
  id: string | number
): Promise<TCheckbookValues> {
  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({ method: "GET" })
  );

  return handleApiResponse<TCheckbookValues>(
    response,
    `Failed to fetch checkbook request by ID ${id}.`
  );
}

/**
 * Updates a checkbook request (PUT) with all the data fields.
 */
export async function updateCheckBookById(
  id: string | number,
  values: TCheckbookFormValues
): Promise<TCheckbookValues> {
  const payload = {
    fullName: values.fullName,
    address: values.address,
    accountNumber: values.accountNumber,
    representativeId: values.representativeId,
    branch: values.branch,
    date: values.date,
    bookContaining: values.bookContaining,
  };

  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );

  return handleApiResponse<TCheckbookValues>(
    response,
    `Failed to update checkbook request with ID ${id}.`
  );
}
