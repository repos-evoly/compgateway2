"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler"; // Adjust path
import type {
  TCheckRequestValues,
  TCheckRequestsResponse,
} from "./types";

/**
 * Get a list of check requests with optional pagination/search
 */
export async function getCheckRequests(
  page: number,
  limit: number,
  searchTerm: string = "",
  searchBy: string = ""
): Promise<TCheckRequestsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API not defined");
  }
  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token");
  }

  const url = new URL(`${baseUrl}/checkrequests`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (searchTerm) url.searchParams.set("searchTerm", searchTerm);
  if (searchBy) url.searchParams.set("searchBy", searchBy);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch check requests. Status: ${res.status}`);
  }

  const data = (await res.json()) as TCheckRequestsResponse;
  return data;
}

/**
 * Get a single check request by ID: /checkrequests/{id}
 */
export async function getCheckRequestById(
  id: string | number
): Promise<TCheckRequestValues> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API not defined");
  }
  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token");
  }

  const res = await fetch(`${baseUrl}/checkrequests/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch check request ${id}. Status: ${res.status}`);
  }

  const data = (await res.json()) as TCheckRequestValues;
  return data;
}

/**
 * Create a new check request (POST /checkrequests)
 */
export async function createCheckRequest(payload: {
  branch: string;
  branchNum: string;
  date: string; // must be ISO string
  customerName: string;
  cardNum: string;
  accountNum: string;
  beneficiary: string;
  lineItems: { dirham: string; lyd: string }[];
}): Promise<TCheckRequestValues> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API not defined");
  }
  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token");
  }

  const res = await fetch(`${baseUrl}/checkrequests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to create check request. Status: ${res.status}`);
  }

  // Return created record from the API
  const data = (await res.json()) as TCheckRequestValues;
  return data;
}
