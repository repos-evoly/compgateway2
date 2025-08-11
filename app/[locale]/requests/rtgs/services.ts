"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import { TRTGSResponse, TRTGSValues } from "./types";
import { TKycResponse } from "@/app/auth/register/types";
import { throwApiError } from "@/app/helpers/handleApiError";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";

const shouldRefresh = (s: number) => s === 401 || s === 403;

/**
 * GET /rtgsrequests?page={}&limit={}
 * Returns { data, page, limit, totalPages, totalRecords }
 */
export async function getRtgsRequests(
  page: number,
  limit: number
): Promise<TRTGSResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = new URL(`${BASE_URL}/rtgsrequests`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: { Authorization: `Bearer ${bearer}` },
    cache: "no-store",
  });

  let response = await fetch(url.toString(), init(token));

  if (shouldRefresh(response.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url.toString(), init(token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch RTGS requests.");
  }

  const data = (await response.json()) as TRTGSResponse;
  return data;
}

/**
 * GET /rtgsrequests/{id}
 */
export async function getRtgsRequestById(
  id: string | number
): Promise<TRTGSValues> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = `${BASE_URL}/rtgsrequests/${id}`;

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: { Authorization: `Bearer ${bearer}` },
    cache: "no-store",
  });

  let response = await fetch(url, init(token));

  if (shouldRefresh(response.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(
      response,
      `Failed to fetch RTGS request by ID ${id}.`
    );
  }

  const data = (await response.json()) as TRTGSValues;
  return data;
}

/**
 * POST /rtgsrequests
 * Creates a new RTGS request and returns the created record.
 */
export async function createRtgsRequest(
  values: TRTGSValues
): Promise<TRTGSValues> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const body: {
    refNum: string;
    date: string;
    paymentType: string;
    accountNo: string;
    applicantName: string;
    address: string;
    beneficiaryName: string;
    beneficiaryAccountNo: string;
    beneficiaryBank: string;
    branchName: string;
    amount: string;
    remittanceInfo: string;
    invoice: boolean;
    contract: boolean;
    claim: boolean;
    otherDoc: boolean;
  } = {
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

  const url = `${BASE_URL}/rtgsrequests`;

  const init = (bearer: string): RequestInit => ({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  let response = await fetch(url, init(token));

  if (shouldRefresh(response.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(response, "Failed to create RTGS request.");
  }

  const created = (await response.json()) as TRTGSValues;
  return created;
}

/**
 * PUT /rtgsrequests/{id}
 * Updates an existing RTGS request and returns the updated record.
 */
export async function updateRtgsRequest(
  id: string | number,
  values: TRTGSValues
): Promise<TRTGSValues> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const body: {
    refNum: string;
    date: string;
    paymentType: string;
    accountNo: string;
    applicantName: string;
    address: string;
    beneficiaryName: string;
    beneficiaryAccountNo: string;
    beneficiaryBank: string;
    branchName: string;
    amount: string;
    remittanceInfo: string;
    invoice: boolean;
    contract: boolean;
    claim: boolean;
    otherDoc: boolean;
  } = {
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

  const url = `${BASE_URL}/rtgsrequests/${id}`;

  const init = (bearer: string): RequestInit => ({
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  let response = await fetch(url, init(token));

  if (shouldRefresh(response.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(response, "Failed to update RTGS request.");
  }

  const updated = (await response.json()) as TRTGSValues;
  return updated;
}

/**
 * GET /companies/kyc/{code}
 * Fetch KYC data by company code (6 digits after first 4 digits of account number)
 */
export async function getKycByCode(code: string): Promise<TKycResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = `${BASE_URL}/companies/kyc/${code}`;

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: { Authorization: `Bearer ${bearer}` },
    cache: "no-store",
  });

  let response = await fetch(url, init(token));

  if (shouldRefresh(response.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch KYC data");
  }

  return response.json();
}
