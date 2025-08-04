"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { throwApiError } from "@/app/helpers/handleApiError";
import {
  BeneficiaryPayload,
  BeneficiaryResponse,
  BeneficiariesApiResponse,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;
const token = getAccessTokenFromCookies();

/**
 * POST /api/beneficiaries
 * Create a new beneficiary
 */
export async function createBeneficiary(
  payload: BeneficiaryPayload
): Promise<BeneficiaryResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/api/beneficiaries`;

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
 * GET /api/beneficiaries
 * Get all beneficiaries with pagination and search
 */
export async function getBeneficiaries(
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<BeneficiariesApiResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${BASE_URL}/api/beneficiaries`);

  // Add query parameters
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());
  if (searchTerm) {
    url.searchParams.append("search", searchTerm);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch beneficiaries.");
  }

  const data = await res.json();
  console.log("Fetched Beneficiaries:", data);
  return data as BeneficiariesApiResponse;
}

/**
 * GET /api/beneficiaries/{id}
 * Get beneficiary by ID
 */
export async function getBeneficiaryById(
  id: number
): Promise<BeneficiaryResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/api/beneficiaries/${id}`;

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
 * PUT /api/beneficiaries/{id}
 * Update beneficiary by ID
 */
export async function updateBeneficiary(
  id: number,
  payload: BeneficiaryPayload
): Promise<BeneficiaryResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/api/beneficiaries/${id}`;

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
 * DELETE /api/beneficiaries/{id}
 * Delete beneficiary by ID
 */
export async function deleteBeneficiary(id: number): Promise<void> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/api/beneficiaries/${id}`;

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
