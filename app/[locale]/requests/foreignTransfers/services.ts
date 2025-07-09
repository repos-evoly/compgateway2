"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import type {
  ForeignTransferDetailResponse,
  ForeignTransfersListResponse,
  CreateForeignTransferPayload,
} from "./types";
import { throwApiError } from "@/app/helpers/handleApiError";


const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";

/**
 * GET /foreigntransfers => listing with pagination
 */
export async function getForeignTransfers(
  page: number,
  limit: number,
  searchTerm = "",
  searchBy = ""
): Promise<ForeignTransfersListResponse> {
  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${baseUrl}/foreigntransfers`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (searchTerm) url.searchParams.set("searchTerm", searchTerm);
  if (searchBy) url.searchParams.set("searchBy", searchBy);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

/* getForeignTransfers */
if (!res.ok) {
  await throwApiError(res, "Failed to fetch foreign transfers.");
}


  const data = (await res.json()) as ForeignTransfersListResponse;
  return data;
}

/**
 * GET /foreigntransfers/{id} => single detail
 */
export async function getForeignTransferById(
  id: string | number
): Promise<ForeignTransferDetailResponse> {
  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${baseUrl}/foreigntransfers/${id}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

/* getForeignTransferById */
if (!res.ok) {
  await throwApiError(res, `Failed to fetch foreign transfer ${id}.`);
}


  const data = (await res.json()) as ForeignTransferDetailResponse;
  return data;
}

/**
 * POST /foreigntransfers => create a new foreign transfer
 */
export async function createForeignTransfer(
  payload: CreateForeignTransferPayload
): Promise<ForeignTransferDetailResponse> {
  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${baseUrl}/foreigntransfers`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

/* createForeignTransfer */
if (!res.ok) {
  await throwApiError(res, "Failed to create foreign transfer.");
}


  const data = (await res.json()) as ForeignTransferDetailResponse;
  return data;
}

/**
 * PUT /foreigntransfers/{id} => update an existing foreign transfer
 */
export async function updateForeignTransfer(
  id: string | number,
  payload: CreateForeignTransferPayload
): Promise<ForeignTransferDetailResponse> {
  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${baseUrl}/foreigntransfers/${id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to update foreign transfer.");
  }

  const data = (await res.json()) as ForeignTransferDetailResponse;
  return data;
}
