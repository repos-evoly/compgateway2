"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import type {
  ForeignTransferDetailResponse,
  ForeignTransfersListResponse,
  CreateForeignTransferPayload,
} from "./types";

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

  if (!res.ok) {
    throw new Error(`Failed to fetch foreign transfers. Status: ${res.status}`);
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

  if (!res.ok) {
    throw new Error(
      `Failed to fetch foreign transfer ${id}. Status: ${res.status}`
    );
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

  if (!res.ok) {
    throw new Error(`Failed to create foreign transfer. Status: ${res.status}`);
  }

  const data = (await res.json()) as ForeignTransferDetailResponse;
  return data;
}
