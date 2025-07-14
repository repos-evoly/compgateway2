"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler"; // Adjust path
import { CheckAccountResponse, EconomicSectorGetResponse, TransferPayload, TransferResponse, TransfersApiResponse, TransfersCommision } from "./types"; // Adjust path
import { throwApiError } from "@/app/helpers/handleApiError";  

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
    await throwApiError(res, "Failed to create transfer.");           
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
    await throwApiError(res, "Failed to get transfers.");           
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
    await throwApiError(res, "Failed to get transfer.");             
  }

  const data = await res.json();
  return data as TransferResponse;
}



export async function getTransfersCommision(servicePackageId:number, transactionCategoryId:number): Promise<TransfersCommision>{

  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  const url = `${BASE_URL}/servicepackages/${servicePackageId}/categories/${transactionCategoryId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to create fetch commission.");            
  }

  const data = (await res.json()) as TransfersCommision;
  return data;
}


export async function getEconomicSectors(page: number, limit:number, searchTerm?:string):Promise<EconomicSectorGetResponse>{

  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  const url = new URL(`${BASE_URL}/economic-sectors`);
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
    await throwApiError(res, "Failed to fetch economic sector.");           
  }

  const data = (await res.json()) as EconomicSectorGetResponse;
  return data;
}

export async function checkAccount(account:string): Promise<CheckAccountResponse[]>{

  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not set.");
  }

  const url = `${BASE_URL}/transfers/accounts?account=${account}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to check account.");            
  }

  const data = (await res.json()) as CheckAccountResponse[];
  return data;
}
