"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import type {
  LetterOfGuaranteeApiItem,
  LetterOfGuaranteeApiResponse,
  TLetterOfGuarantee,
} from "./types";

import { throwApiError } from "@/app/helpers/handleApiError";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
const token = getAccessTokenFromCookies();

/** 
 * Fetch (GET) letter of guarantees with pagination & search. 
 * Always uses `?searchTerm=letterOfGuarantee&searchBy=type` to filter 
 * on the server side so it only returns items of type="letterOfGuarantee".
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
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  // Always ensure we pass `searchTerm=letterOfGuarantee&searchBy=type`
  const url = new URL(`${BASE_API}/creditfacilities?searchTerm=letterOfGuarantee&searchBy=type`);
  url.searchParams.append("page", String(page));
  url.searchParams.append("limit", String(limit));

  // If user typed in the search bar => pass searchTerm + searchBy
  if (searchTerm) {
    url.searchParams.append("searchTerm", searchTerm);
  }
  if (searchBy) {
    url.searchParams.append("searchBy", searchBy);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch letter of guarantee.");
  }

  const data: LetterOfGuaranteeApiResponse = await res.json();
  return data;
}

/**
 * Create (POST) a new letter of guarantee at /creditfacilities
 * Because the endpoint is the same, but the `type` we submit is "letterOfGuarantee".
 */
export async function addLetterOfGuarantee(
  payload: Omit<TLetterOfGuarantee, "id"> // exclude "id" for new records
): Promise<LetterOfGuaranteeApiItem> {
  if (!BASE_API) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_API}/creditfacilities`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      accountNumber: payload.accountNumber,
      date: payload.date,
      amount: payload.amount,
      purpose: payload.purpose,
      additionalInfo: payload.additionalInfo,
      curr: payload.curr,
      referenceNumber: payload.refferenceNumber, // note the field name difference
      type: payload.type, // always "letterOfGuarantee"
    }),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to create letter of guarantee.");
  }

  const data = await res.json();
  return data as LetterOfGuaranteeApiItem;
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
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_API}/creditfacilities/${id}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, `Failed to fetch letter of guarantee #${id}.`);
  }

  const data = await res.json();
  return data as LetterOfGuaranteeApiItem;
}
