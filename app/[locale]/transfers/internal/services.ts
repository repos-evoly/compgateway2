"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler"; // Adjust path
import { TransferPayload, TransferResponse } from "./types"; // Adjust path

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";

/**
 * Create a transfer by POSTing to /transfers
 * Body sample:
 * {
 *   "transactionCategoryId": 0,
 *   "fromAccount": "string",
 *   "toAccount": "string",
 *   "amount": 0,
 *   "currencyId": 0,
 *   "description": "string"
 * }
 */
export async function createTransfer(
  payload: TransferPayload
): Promise<TransferResponse> {
  const token = getAccessTokenFromCookies();
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
