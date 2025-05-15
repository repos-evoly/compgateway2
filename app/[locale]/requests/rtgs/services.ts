"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler"; // adjust path
import { TRTGSResponse, TRTGSValues } from "./types";

/**
 * GET /rtgsrequests?page={}&limit={}
 * Returns { data, page, limit, totalPages, totalRecords }
 */
export async function getRtgsRequests(
  page: number,
  limit: number
): Promise<TRTGSResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${baseUrl}/rtgsrequests`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch RTGS requests. Status: ${response.status}`);
  }

  const data = (await response.json()) as TRTGSResponse;
  return data;
}

export async function getRtgsRequestById(id: string | number): Promise<TRTGSValues> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_API is not defined");
    }
    const token = getAccessTokenFromCookies();
    if (!token) {
      throw new Error("No access token found in cookies");
    }
  
    const response = await fetch(`${baseUrl}/rtgsrequests/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch RTGS request by ID ${id}. Status: ${response.status}`);
    }
  
    const data = (await response.json()) as TRTGSValues;
    return data;
  }
