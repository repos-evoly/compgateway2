"use client";

import { TCheckRequestFormValues, TCheckRequestsResponse, TCheckRequestValues } from "./types";
import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { throwApiError } from "@/app/helpers/handleApiError";

/**
 * Fetch all check requests (GET), with optional pagination & search.
 */
export async function getCheckRequests(
  page: number,
  limit: number,
  searchTerm: string = "",
  searchBy: string = ""
): Promise<TCheckRequestsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API; 
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${baseUrl}/checkrequests`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (searchTerm) url.searchParams.set("searchTerm", searchTerm);
  if (searchBy) url.searchParams.set("searchBy", searchBy);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch check requests.");
  }

  return response.json() as Promise<TCheckRequestsResponse>;
}

/**
 * Creates a new check request (POST)
 */
export async function createCheckRequest(values: TCheckRequestFormValues): Promise<TCheckRequestValues> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API; 
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  // Convert form values to API format
  const payload = {
    branch: values.branch,
    branchNum: values.branchNum,
    date: values.date.toISOString(), // Convert Date to ISO string
    customerName: values.customerName,
    cardNum: values.cardNum,
    accountNum: values.accountNum,
    beneficiary: values.beneficiary,
    lineItems: values.lineItems.map(item => ({
      dirham: item.dirham,
      lyd: item.lyd,
    })),
  };

  const response = await fetch(`${baseUrl}/checkrequests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to create check request.");
  }

  return response.json();
}

/**
 * Fetch a single check request by ID (GET)
 */
export async function getCheckRequestById(id: string | number): Promise<TCheckRequestValues> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const response = await fetch(`${baseUrl}/checkrequests/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await throwApiError(response, `Failed to fetch check request by ID ${id}.`);
  }

  const data = await response.json();
  return data as TCheckRequestValues;
}

/**
 * Updates a check request (PUT) with all the data fields.
 */
export async function updateCheckRequestById(
  id: string | number,
  values: TCheckRequestFormValues
): Promise<TCheckRequestValues> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  // Convert form values to API format
  const payload = {
    branch: values.branch,
    branchNum: values.branchNum,
    date: values.date.toISOString(), // Convert Date to ISO string
    customerName: values.customerName,
    cardNum: values.cardNum,
    accountNum: values.accountNum,
    beneficiary: values.beneficiary,
    lineItems: values.lineItems.map(item => ({
      dirham: item.dirham,
      lyd: item.lyd,
    })),
  };

  const response = await fetch(`${baseUrl}/checkrequests/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwApiError(response, `Failed to update check request with ID ${id}.`);
  }

  const responseData = await response.json();
  return responseData as TCheckRequestValues;
}