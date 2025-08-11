// app/(wherever)/visarequests/services.ts
"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import {
  VisaRequestApiResponse,
  VisaRequestApiItem,
  VisaRequestFormValues,
} from "./types";
import { throwApiError } from "@/app/helpers/handleApiError";
import { TKycResponse } from "@/app/auth/register/types";
import { mergeFilesToPdf } from "@/app/components/reusable/DocumentUploader";

const shouldRefresh = (s: number) => s === 401 || s === 403;

export const getVisaRequests = async (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = ""
): Promise<VisaRequestApiResponse> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined in .env");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${baseUrl}/visarequests`);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());
  if (searchTerm) url.searchParams.set("searchTerm", searchTerm);

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
      // fall through to shared error handling
    }
  }

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch visa requests");
  }

  return (await response.json()) as VisaRequestApiResponse;
};

/**
 * Convert API attachment URLs to displayable URLs
 */
const convertAttachmentToUrl = (attachment: { attUrl: string }): string => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";
  const urlPath = attachment.attUrl.replace(/\\/g, "/");
  return `${baseUrl}/${urlPath}`;
};

/** New function: get by ID => returns a single VisaRequestApiItem */
export const getVisaRequestById = async (
  id: number
): Promise<VisaRequestApiItem> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined in .env");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${baseUrl}/visarequests/${id}`;

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
    await throwApiError(response, "Failed to fetch visa request by ID");
  }

  const data = (await response.json()) as VisaRequestApiItem;

  if (data.attachments && data.attachments.length > 0) {
    data.attachments = data.attachments.map((attachment) => ({
      ...attachment,
      displayUrl: convertAttachmentToUrl(attachment),
    }));
  }

  return data;
};

export const createVisaRequest = async (
  formValues: VisaRequestFormValues & { files?: File[] }
): Promise<VisaRequestApiItem> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_API is not defined in .env");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const isoDate =
    formValues.date && formValues.date.length === 10
      ? new Date(`${formValues.date}T00:00:00Z`).toISOString()
      : formValues.date ?? "";

  const dto = {
    branch: formValues.branch ?? "",
    date: isoDate,
    accountHolderName: formValues.accountHolderName ?? "",
    accountNumber:
      typeof formValues.accountNumber === "string"
        ? formValues.accountNumber
        : String(formValues.accountNumber ?? ""),
    phoneNumberLinkedToNationalId: String(
      formValues.phoneNumberLinkedToNationalId ?? ""
    ),
    nationalId: Number(formValues.nationalId) || 0,
    foreignAmount: Number(formValues.foreignAmount) || 0,
    localAmount: Number(formValues.localAmount) || 0,
    cbl: String(formValues.cbl ?? ""),
    cardMovementApproval: String(formValues.cardMovementApproval ?? ""),
    cardUsingAcknowledgment: String(formValues.cardUsingAcknowledgment ?? ""),
    pldedge: String(formValues.pldedge ?? ""),
  } as const;

  const formData = new FormData();
  formData.append("Dto", JSON.stringify(dto));

  const files = formValues.files ?? [];
  if (files.length > 1) {
    const { blob } = await mergeFilesToPdf(files, 5);
    formData.append("files", blob, "documents.pdf");
  } else if (files.length === 1) {
    formData.append("files", files[0], files[0].name);
  }

  const url = `${baseUrl}/visarequests`;

  const init = (bearer: string): RequestInit => ({
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`,
      Accept: "application/json",
    },
    body: formData,
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
    await throwApiError(response, "Failed to create visa request");
  }

  return (await response.json()) as VisaRequestApiItem;
};

export const updateVisaRequest = async (
  id: number,
  formValues: VisaRequestFormValues & { files?: File[] }
): Promise<VisaRequestApiItem> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_API is not defined in .env");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const isoDate =
    formValues.date && formValues.date.length === 10
      ? new Date(`${formValues.date}T00:00:00Z`).toISOString()
      : formValues.date ?? "";

  const dto = {
    branch: formValues.branch ?? "",
    date: isoDate,
    accountHolderName: formValues.accountHolderName ?? "",
    accountNumber:
      typeof formValues.accountNumber === "string"
        ? formValues.accountNumber
        : String(formValues.accountNumber ?? ""),
    phoneNumberLinkedToNationalId: String(
      formValues.phoneNumberLinkedToNationalId ?? ""
    ),
    nationalId: Number(formValues.nationalId) || 0,
    foreignAmount: Number(formValues.foreignAmount) || 0,
    localAmount: Number(formValues.localAmount) || 0,
    cbl: String(formValues.cbl ?? ""),
    cardMovementApproval: String(formValues.cardMovementApproval ?? ""),
    cardUsingAcknowledgment: formValues.cardUsingAcknowledgment ?? "",
    pldedge: formValues.pldedge ?? "",
  } as const;

  const formData = new FormData();
  formData.append("Dto", JSON.stringify(dto));

  const files = formValues.files ?? [];
  if (files.length > 1) {
    const { blob } = await mergeFilesToPdf(files, 5);
    formData.append("files", blob, "documents.pdf");
  } else if (files.length === 1) {
    formData.append("files", files[0], files[0].name);
  }

  const url = `${baseUrl}/visarequests/${id}`;

  const init = (bearer: string): RequestInit => ({
    method: "PUT",
    headers: {
      Authorization: `Bearer ${bearer}`,
      Accept: "application/json",
    },
    body: formData,
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
    await throwApiError(response, "Failed to update visa request");
  }

  return (await response.json()) as VisaRequestApiItem;
};

/**
 * Fetch KYC data by company code (6 digits after first 4 digits of account number)
 */
export async function getKycByCode(code: string): Promise<TKycResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${baseUrl}/companies/kyc/${code}`;

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

  return (await response.json()) as TKycResponse;
}
