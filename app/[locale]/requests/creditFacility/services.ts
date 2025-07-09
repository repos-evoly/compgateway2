"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import type {
  CreditFacilityApiItem,
  CreditFacilitiesApiResponse,
  TCreditFacility,
} from "./types";
import { throwApiError } from "@/app/helpers/handleApiError";


const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
const token = getAccessTokenFromCookies();

/** Fetch (GET) credit facilities with pagination & search. */
export async function getCreditFacilities(
  page = 1,
  limit = 10,
  searchTerm = "",
  searchBy = ""
): Promise<CreditFacilitiesApiResponse> {
  if (!BASE_API) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${BASE_API}/creditfacilities?searchTerm=creditFacility&searchBy=type`);
  url.searchParams.append("page", String(page));
  url.searchParams.append("limit", String(limit));
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
    await throwApiError(res, "Failed to fetch credit facilities.");
  }
  

  const data: CreditFacilitiesApiResponse = await res.json();
  return data;
}


export async function addCreditFacility(
  payload: Omit<TCreditFacility, "id"> // exclude "id" for new records
): Promise<CreditFacilityApiItem> {
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
      type: payload.type,
    }),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to create credit facility.");
  }
  

  const data = await res.json();
  return data as CreditFacilityApiItem;
}


export async function getCreditFacilityById(
    id: number
  ): Promise<CreditFacilityApiItem> {
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
      await throwApiError(res, `Failed to fetch credit facility ID=${id}.`);
    }
    
  
    const data: CreditFacilityApiItem = await res.json();
    return data;
  }


export async function updateCreditFacilityById(
  id: number,
  payload: TCreditFacility
): Promise<CreditFacilityApiItem> {
  if (!BASE_API) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_API}/creditfacilities/${id}`;

  const res = await fetch(url, {
    method: "PUT",
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
      type: payload.type,
      status: payload.status,
    }),
  });

  if (!res.ok) {
    await throwApiError(res, `Failed to update credit facility ID=${id}.`);
  }

  const data = await res.json();
  return data as CreditFacilityApiItem;
}