// app/(wherever)/visarequests/services.ts
import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { VisaRequestApiResponse, VisaRequestApiItem, VisaRequestFormValues } from "./types";
import { throwApiError } from "@/app/helpers/handleApiError";
import { TKycResponse } from "@/app/auth/register/types";
import { mergeFilesToPdf } from "@/app/components/reusable/DocumentUploader";


const token = getAccessTokenFromCookies();

export const getVisaRequests = async (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = ""
): Promise<VisaRequestApiResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api"; 
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined in .env");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  // Construct the URL with query params
  const url = new URL(`${baseUrl}/visarequests`);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());
  if (searchTerm) {
    url.searchParams.set("searchTerm", searchTerm);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch visa requests");
  }

  const data = (await response.json()) as VisaRequestApiResponse;
  return data;
};

/** New function: get by ID => returns a single VisaRequestApiItem */
export const getVisaRequestById = async (
  id: number
): Promise<VisaRequestApiItem> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API ;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined in .env");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${baseUrl}/visarequests/${id}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


  if (!response.ok) {
    await throwApiError(response, "Failed to fetch visa request by ID");
  }

  const data = (await response.json()) as VisaRequestApiItem;
  return data;
};


export const createVisaRequest = async (
  formValues: VisaRequestFormValues & { files?: File[] }
): Promise<VisaRequestApiItem> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_API ;
  if (!token) throw new Error("No access token found in cookies");

  // 1) build a proper ISO date string when you get YYYY-MM-DD
  const isoDate =
    formValues.date && formValues.date.length === 10
      ? new Date(`${formValues.date}T00:00:00Z`).toISOString()
      : formValues.date ?? "";

  // 2) your DTO must include every field
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
    cardUsingAcknowledgment: String(
      formValues.cardUsingAcknowledgment ?? ""
    ),
    pldedge: String(formValues.pldedge ?? ""),
  } as const;

  // 3) package it as form-data
  const formData = new FormData();
  formData.append("Dto", JSON.stringify(dto)); // must be exactly "Dto"

  // 4) append each file (or merged blob) under any key
  const files = formValues.files ?? [];
  if (files.length > 1) {
    const { blob } = await mergeFilesToPdf(files, 5 /* MB cap */);
    formData.append("files", blob, "documents.pdf");
  } else if (files.length === 1) {
    formData.append("files", files[0], files[0].name);
  }

  // 5) fire off the request—**do not** set a Content-Type header, let fetch infer it
  const response = await fetch(`${baseUrl}/visarequests`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to create visa request");
  }

  return (await response.json()) as VisaRequestApiItem;
};

export const updateVisaRequest = async (
  id: number,
  formValues: VisaRequestFormValues & { files?: File[] }
): Promise<VisaRequestApiItem> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API ;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_API is not defined in .env");
  if (!token) throw new Error("No access token found in cookies");

  const isoDate =
    formValues.date && formValues.date.length === 10   // "2025-06-20"
      ? new Date(`${formValues.date}T00:00:00Z`).toISOString() // → "2025-06-20T00:00:00.000Z"
      : formValues.date ?? "";

  // The API requires all fields (string/number).
  // We'll convert `undefined` => "" or 0.
  const dto = {
    branch: formValues.branch ?? "",
    date: isoDate,
    accountHolderName: formValues.accountHolderName ?? "",
  
    // 1️⃣  Account number must follow 0000-000000-000
    accountNumber:
      typeof formValues.accountNumber === "string"
        ? formValues.accountNumber
        : String(formValues.accountNumber ?? ""),
  
    // 2️⃣  Phone must be sent as *string*
    phoneNumberLinkedToNationalId: String(
      formValues.phoneNumberLinkedToNationalId ?? ""
    ),
  
    // 3️⃣  Cast numbers
    nationalId: Number(formValues.nationalId) || 0,
    foreignAmount: Number(formValues.foreignAmount) || 0,
    localAmount: Number(formValues.localAmount) || 0,
  
    // 4️⃣  Keep these as strings
    cbl: String(formValues.cbl ?? ""),
    cardMovementApproval: String(formValues.cardMovementApproval ?? ""),
    cardUsingAcknowledgment: formValues.cardUsingAcknowledgment ?? "",
    pldedge: formValues.pldedge ?? "",
  } as const;

  /* ---------- FormData ---------- */
  const formData = new FormData();
  formData.append("Dto", JSON.stringify(dto)); // key MUST be "Dto"

  const files = formValues.files ?? [];
  if (files.length > 1) {
    const { blob } = await mergeFilesToPdf(files, 5); // 5 MB cap
    formData.append("files", blob, "documents.pdf");
  } else if (files.length === 1) {
    formData.append("files", files[0], files[0].name);
  }

  const response = await fetch(`${baseUrl}/visarequests/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to update visa request");
  }

  // The API might return the updated item
  const updated = (await response.json()) as VisaRequestApiItem;
  return updated;
};

/**
 * Fetch KYC data by company code (6 digits after first 4 digits of account number)
 */
export async function getKycByCode(code: string): Promise<TKycResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API ;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const response = await fetch(`${baseUrl}/companies/kyc/${code}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch KYC data");
  }

  return response.json();
}