"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { throwApiError } from "@/app/helpers/handleApiError";
import {
  BeneficiaryPayload,
  BeneficiaryResponse,
  BeneficiariesApiResponse,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";

/**
 * POST /beneficiaries
 * Create a new beneficiary
 */
export async function createBeneficiary(
  payload: BeneficiaryPayload
): Promise<BeneficiaryResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/beneficiaries`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to create beneficiary.");
  }

  const data = await res.json();
  console.log("Created Beneficiary:", data);
  return data as BeneficiaryResponse;
}

/**
 * GET /beneficiaries
 * Get all beneficiaries with pagination and search
 */
export async function getBeneficiaries(
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<BeneficiariesApiResponse> {
  console.log("getBeneficiaries called with:", { page, limit, searchTerm });
  console.log("BASE_URL:", BASE_URL);

  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  console.log("Token found:", !!token);
  console.log("Token length:", token?.length || 0);

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${BASE_URL}/beneficiaries`);
  console.log("Request URL:", url.toString());

  // Add query parameters
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());
  if (searchTerm) {
    url.searchParams.set("search", searchTerm);
  }

  console.log("Making request to:", url.toString());

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response status:", res.status, res.statusText);
    console.log("Response headers:", Object.fromEntries(res.headers.entries()));
  } catch (error) {
    console.error("Network error:", error);
    throw new Error(
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch beneficiaries.");
  }

  const data = await res.json();
  console.log("Fetched Beneficiaries:", data);
  console.log("Data structure:", JSON.stringify(data, null, 2));

  // Handle case where API returns array directly instead of paginated object
  if (Array.isArray(data)) {
    return {
      data: data,
      page: page,
      limit: limit,
      totalPages: 1,
      totalRecords: data.length,
    } as BeneficiariesApiResponse;
  }

  return data as BeneficiariesApiResponse;
}

/**
 * GET /beneficiaries/{id}
 * Get beneficiary by ID
 */
export async function getBeneficiaryById(
  id: number
): Promise<BeneficiaryResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/beneficiaries/${id}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch beneficiary.");
  }

  const data = await res.json();
  console.log("Fetched Beneficiary by ID:", data);
  return data as BeneficiaryResponse;
}

/**
 * PUT /beneficiaries/{id}
 * Update beneficiary by ID
 */
export async function updateBeneficiary(
  id: number,
  payload: BeneficiaryPayload
): Promise<BeneficiaryResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/beneficiaries/${id}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to update beneficiary.");
  }

  const data = await res.json();
  console.log("Updated Beneficiary:", data);
  return data as BeneficiaryResponse;
}

/**
 * DELETE /beneficiaries/{id}
 * Delete beneficiary by ID
 */
export async function deleteBeneficiary(id: number): Promise<void> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/beneficiaries/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to delete beneficiary.");
  }

  console.log("Deleted Beneficiary:", id);
}
