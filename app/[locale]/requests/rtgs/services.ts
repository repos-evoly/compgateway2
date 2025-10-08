"use client";

import { throwApiError } from "@/app/helpers/handleApiError";
import type { TKycResponse } from "@/app/auth/register/types";
import type { TRTGSResponse, TRTGSValues } from "./types";

const API_BASE = "/Companygw/api/requests/rtgs" as const;
const KYC_API_BASE = "/Companygw/api/companies/kyc" as const;

const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});

const buildListUrl = (
  page: number,
  limit: number,
  searchTerm: string,
  searchBy: "" | "paymenttype" | "beneficiarybank"
): string => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (searchTerm) params.set("searchTerm", searchTerm);
  if (searchBy) params.set("searchBy", searchBy);
  const qs = params.toString();
  return qs ? `${API_BASE}?${qs}` : API_BASE;
};

const jsonInit = (method: "POST" | "PUT", payload: unknown): RequestInit =>
  withCredentials({
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

/**
 * GET /rtgsrequests?page={}&limit={}&searchTerm=&searchBy=
 * searchBy must be "paymenttype" or "beneficiarybank" (lowercase)
 */
export async function getRtgsRequests(
  page: number,
  limit: number,
  searchTerm: string = "",
  searchBy: "" | "paymenttype" | "beneficiarybank" = ""
): Promise<TRTGSResponse> {
  const response = await fetch(
    buildListUrl(page, limit, searchTerm, searchBy),
    withCredentials({ method: "GET" })
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch RTGS requests.");
  }

  return (await response.json()) as TRTGSResponse;
}

/**
 * GET /rtgsrequests/{id}
 */
export async function getRtgsRequestById(
  id: string | number
): Promise<TRTGSValues> {
  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({ method: "GET" })
  );

  if (!response.ok) {
    await throwApiError(response, `Failed to fetch RTGS request by ID ${id}.`);
  }

  return (await response.json()) as TRTGSValues;
}

/**
 * POST /rtgsrequests
 * Creates a new RTGS request and returns the created record.
 */
export async function createRtgsRequest(
  values: TRTGSValues
): Promise<TRTGSValues> {
  const body = {
    refNum: new Date(values.refNum).toISOString(),
    date: new Date(values.date).toISOString(),
    paymentType: values.paymentType,
    accountNo: values.accountNo,
    applicantName: values.applicantName,
    address: values.address,
    beneficiaryName: values.beneficiaryName,
    beneficiaryAccountNo: values.beneficiaryAccountNo,
    beneficiaryBank: values.beneficiaryBank,
    branchName: values.branchName,
    amount: values.amount,
    remittanceInfo: values.remittanceInfo,
    invoice: values.invoice ?? false,
    contract: values.contract ?? false,
    claim: values.claim ?? false,
    otherDoc: values.otherDoc ?? false,
  };

  const response = await fetch(API_BASE, jsonInit("POST", body));

  if (!response.ok) {
    await throwApiError(response, "Failed to create RTGS request.");
  }

  return (await response.json()) as TRTGSValues;
}

/**
 * PUT /rtgsrequests/{id}
 * Updates an existing RTGS request and returns the updated record.
 */
export async function updateRtgsRequest(
  id: string | number,
  values: TRTGSValues
): Promise<TRTGSValues> {
  const body = {
    refNum: new Date(values.refNum).toISOString(),
    date: new Date(values.date).toISOString(),
    paymentType: values.paymentType,
    accountNo: values.accountNo,
    applicantName: values.applicantName,
    address: values.address,
    beneficiaryName: values.beneficiaryName,
    beneficiaryAccountNo: values.beneficiaryAccountNo,
    beneficiaryBank: values.beneficiaryBank,
    branchName: values.branchName,
    amount: values.amount,
    remittanceInfo: values.remittanceInfo,
    invoice: values.invoice ?? false,
    contract: values.contract ?? false,
    claim: values.claim ?? false,
    otherDoc: values.otherDoc ?? false,
  };

  const response = await fetch(`${API_BASE}/${id}`, jsonInit("PUT", body));

  if (!response.ok) {
    await throwApiError(response, "Failed to update RTGS request.");
  }

  return (await response.json()) as TRTGSValues;
}

/**
 * GET /companies/kyc/{code}
 * Fetch KYC data by company code (6 digits after first 4 digits of account number)
 */
export async function getKycByCode(code: string): Promise<TKycResponse> {
  const response = await fetch(
    `${KYC_API_BASE}/${code}`,
    withCredentials({ method: "GET" })
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch KYC data");
  }

  return (await response.json()) as TKycResponse;
}
