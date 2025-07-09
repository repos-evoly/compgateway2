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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";
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



  /**
 * POST /rtgsrequests
 * Creates a new RTGS request and returns the created record.
 */
export async function createRtgsRequest(
  values: TRTGSValues,
): Promise<TRTGSValues> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  /** Build the exact body the API expects */
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

  const response = await fetch(`${baseUrl}/rtgsrequests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create RTGS request. Status: ${response.status}`,
    );
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
  values: TRTGSValues,
): Promise<TRTGSValues> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  /** Build the exact body the API expects */
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

  const response = await fetch(`${baseUrl}/rtgsrequests/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update RTGS request. Status: ${response.status}`,
    );
  }

  const updated = (await response.json()) as TRTGSValues;
  return updated;
}
