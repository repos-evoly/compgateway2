"use client";

import { TCheckbookFormValues, TCheckbookResponse, TCheckbookValues } from "./types";
import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler"; // Adjust path if needed

/**
 * Fetch all checkbook requests (GET), with optional pagination & search.
 */
export async function getCheckbookRequests(
  page: number,
  limit: number,
  searchTerm: string = "",
  searchBy: string = ""
): Promise<TCheckbookResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API; 
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${baseUrl}/checkbookrequests`);
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
    throw new Error(`Failed to fetch checkbook requests. Status: ${response.status}`);
  }

  return response.json() as Promise<TCheckbookResponse>;
}

/**
 * Creates a new checkbook request (POST) with the required body fields.
 */
export async function createCheckbookRequest(values: TCheckbookFormValues) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API; 
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  // Build the payload according to the API shape
  const payload = {
    fullName: values.fullName,
    address: values.address,
    accountNumber: values.accountNumber,
    pleaseSend: values.pleaseSend,
    branch: values.branch,
    date: values.date, 
    bookContaining: values.bookContaining,
  };

  const response = await fetch(`${baseUrl}/checkbookrequests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create checkbook. Status: ${response.status}`);
  }

  // Return the newly created record (if the API returns it)
  return response.json();
}


export async function getCheckbookRequestById(
    id: string | number
  ): Promise<TCheckbookValues> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_API is not defined");
    }
  
    const token = getAccessTokenFromCookies();
    if (!token) {
      throw new Error("No access token found in cookies");
    }
  
    const response = await fetch(`${baseUrl}/checkbookrequests/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error(
        `Failed to fetch checkbook request by ID ${id}. Status: ${response.status}`
      );
    }
  
    const data = await response.json();
    return data as TCheckbookValues;
  }


  