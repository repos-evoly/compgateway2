"use client";

import { handleApiResponse, ensureApiSuccess } from "@/app/helpers/apiResponse";
import type {
  BeneficiariesApiResponse,
  BeneficiaryPayload,
  BeneficiaryResponse,
} from "./types";

const API_BASE = "/Companygw/api/beneficiaries" as const;

const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});

const jsonRequest = (method: string, body?: unknown): RequestInit =>
  withCredentials({
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

const buildListUrl = (page: number, limit: number, searchTerm: string): string => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (searchTerm) {
    params.set("search", searchTerm);
  }
  const qs = params.toString();
  return qs ? `${API_BASE}?${qs}` : API_BASE;
};

export async function createBeneficiary(
  payload: BeneficiaryPayload
): Promise<BeneficiaryResponse> {
  const response = await fetch(API_BASE, jsonRequest("POST", payload));

  return handleApiResponse<BeneficiaryResponse>(
    response,
    "Failed to create beneficiary."
  );
}

export async function getBeneficiaries(
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<BeneficiariesApiResponse> {
  const response = await fetch(
    buildListUrl(page, limit, searchTerm),
    withCredentials()
  );

  const data = await handleApiResponse<
    BeneficiariesApiResponse | BeneficiaryResponse[]
  >(response, "Failed to fetch beneficiaries.");

  if (Array.isArray(data)) {
    return {
      data,
      page,
      limit,
      totalPages: 1,
      totalRecords: data.length,
    } as BeneficiariesApiResponse;
  }

  return data as BeneficiariesApiResponse;
}

export async function getBeneficiaryById(
  id: number
): Promise<BeneficiaryResponse> {
  const response = await fetch(`${API_BASE}/${id}`, withCredentials());

  return handleApiResponse<BeneficiaryResponse>(
    response,
    "Failed to fetch beneficiary."
  );
}

export async function updateBeneficiary(
  id: number,
  payload: BeneficiaryPayload
): Promise<BeneficiaryResponse> {
  const response = await fetch(
    `${API_BASE}/${id}`,
    jsonRequest("PUT", payload)
  );

  return handleApiResponse<BeneficiaryResponse>(
    response,
    "Failed to update beneficiary."
  );
}

export async function deleteBeneficiary(id: number): Promise<void> {
  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({ method: "DELETE" })
  );

  await ensureApiSuccess(response, "Failed to delete beneficiary.");
}
