"use client";

import { handleApiResponse, ensureApiSuccess } from "@/app/helpers/apiResponse";
import type {
  BeneficiariesApiResponse,
  BeneficiaryPaymentRail,
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

const normalizePaymentRail = (
  value: BeneficiaryResponse["paymentRail"] | string | undefined
): BeneficiaryPaymentRail => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "onepay") return "onePay";
  if (normalized === "lypay") return "lyPay";
  return "normal";
};

const normalizeBeneficiary = (
  beneficiary: BeneficiaryResponse
): BeneficiaryResponse => ({
  ...beneficiary,
  paymentRail: normalizePaymentRail(beneficiary.paymentRail),
});

const buildListUrl = (
  page: number,
  limit: number,
  searchTerm: string,
  searchBy: string,
  paymentRail: BeneficiaryPaymentRail
): string => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    rail: paymentRail,
  });
  if (searchTerm) {
    params.set("searchTerm", searchTerm);
    params.set("searchBy", searchBy);
  }
  const qs = params.toString();
  return qs ? `${API_BASE}?${qs}` : API_BASE;
};

export async function createBeneficiary(
  payload: BeneficiaryPayload
): Promise<BeneficiaryResponse> {
  const response = await fetch(API_BASE, jsonRequest("POST", payload));

  const beneficiary = await handleApiResponse<BeneficiaryResponse>(
    response,
    "Failed to create beneficiary."
  );
  return normalizeBeneficiary(beneficiary);
}

export async function getBeneficiaries(
  page = 1,
  limit = 10,
  searchTerm = "",
  searchBy = "name",
  paymentRail: BeneficiaryPaymentRail = "normal"
): Promise<BeneficiariesApiResponse> {
  const response = await fetch(
    buildListUrl(page, limit, searchTerm, searchBy, paymentRail),
    withCredentials()
  );

  const data = await handleApiResponse<
    BeneficiariesApiResponse | BeneficiaryResponse[]
  >(response, "Failed to fetch beneficiaries.");

  if (Array.isArray(data)) {
    return {
      data: data.map(normalizeBeneficiary),
      page,
      limit,
      totalPages: 1,
      totalRecords: data.length,
    } as BeneficiariesApiResponse;
  }

  return {
    ...data,
    data: Array.isArray(data.data)
      ? data.data.map(normalizeBeneficiary)
      : [],
  } as BeneficiariesApiResponse;
}

export async function getBeneficiariesForRail(
  paymentRail: BeneficiaryPaymentRail
): Promise<BeneficiaryResponse[]> {
  const pageSize = 1000;
  const firstPage = await getBeneficiaries(1, pageSize, "", "name", paymentRail);
  if (firstPage.totalPages <= 1) return firstPage.data;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      getBeneficiaries(index + 2, pageSize, "", "name", paymentRail)
    )
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.data);
}

export async function getBeneficiaryById(
  id: number
): Promise<BeneficiaryResponse> {
  const response = await fetch(`${API_BASE}/${id}`, withCredentials());

  const beneficiary = await handleApiResponse<BeneficiaryResponse>(
    response,
    "Failed to fetch beneficiary."
  );
  return normalizeBeneficiary(beneficiary);
}

export async function updateBeneficiary(
  id: number,
  payload: BeneficiaryPayload
): Promise<BeneficiaryResponse> {
  const response = await fetch(
    `${API_BASE}/${id}/update`,
    jsonRequest("POST", payload)
  );

  const beneficiary = await handleApiResponse<BeneficiaryResponse>(
    response,
    "Failed to update beneficiary."
  );
  return normalizeBeneficiary(beneficiary);
}

export async function deleteBeneficiary(id: number): Promise<void> {
  const response = await fetch(
    `${API_BASE}/${id}/delete`,
    withCredentials({ method: "POST" })
  );

  await ensureApiSuccess(response, "Failed to delete beneficiary.");
}
