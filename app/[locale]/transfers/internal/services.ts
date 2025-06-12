"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler"; // Adjust path
import { TransferPayload, TransferResponse, TransfersApiResponse, TransfersCommision } from "./types"; // Adjust path

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_API ;
  const token = getAccessTokenFromCookies();



export async function createTransfer(
  payload: TransferPayload
): Promise<TransferResponse> {
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/transfers`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to create transfer. Status: ${res.status}`);
  }

  const data = await res.json();
  return data as TransferResponse;
}


export async function getTransfers(
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<TransfersApiResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  const url = new URL(`${BASE_URL}/transfers`);
  url.searchParams.append("page", String(page));
  url.searchParams.append("limit", String(limit));
  if (searchTerm) {
    url.searchParams.append("searchTerm", searchTerm);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch transfers. Status: ${res.status}`);
  }

  const data = (await res.json()) as TransfersApiResponse;
  return data;
}



export async function getTransferById(id: number): Promise<TransferResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/transfers/${id}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch transfer ID=${id}. Status: ${res.status}`);
  }

  const data = await res.json();
  return data as TransferResponse;
}



export async function getTransfersCommision(servicePackageId:number, transactionCategoryId:number, currencyId:number): Promise<TransfersCommision>{

  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  const url = `${BASE_URL}/transfers/commission?servicePackageId=${servicePackageId}&transactionCategoryId=${transactionCategoryId}&currencyId=${currencyId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch transfers commission. Status: ${res.status}`);
  }

  const data = (await res.json()) as TransfersCommision;
  return data;
}


