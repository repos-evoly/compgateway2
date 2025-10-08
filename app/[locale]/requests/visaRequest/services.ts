// app/(wherever)/visarequests/services.ts
"use client";

import {
  VisaRequestApiResponse,
  VisaRequestApiItem,
  VisaRequestFormValues,
} from "./types";
import { throwApiError } from "@/app/helpers/handleApiError";
import { TKycResponse } from "@/app/auth/register/types";
import { mergeFilesToPdf } from "@/app/components/reusable/DocumentUploader";

const API_BASE = "/Companygw/api/requests/visa-request" as const;
const KYC_API_BASE = "/Companygw/api/companies/kyc" as const;
const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});
const DISPLAY_BASE =
  (process.env.NEXT_PUBLIC_BASE_API || "").replace(/\/$/, "");

const buildListUrl = (
  page: number,
  limit: number,
  searchTerm: string
): string => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (searchTerm) params.set("searchTerm", searchTerm);
  const qs = params.toString();
  return qs ? `${API_BASE}?${qs}` : API_BASE;
};

export const getVisaRequests = async (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = ""
): Promise<VisaRequestApiResponse> => {
  const response = await fetch(
    buildListUrl(page, limit, searchTerm),
    withCredentials({ method: "GET" })
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch visa requests");
  }

  return (await response.json()) as VisaRequestApiResponse;
};

/**
 * Convert API attachment URLs to displayable URLs
 */
const convertAttachmentToUrl = (attachment: { attUrl: string }): string => {
  const urlPath = attachment.attUrl.replace(/\\/g, "/");
  return DISPLAY_BASE ? `${DISPLAY_BASE}/${urlPath}` : urlPath;
};

/** New function: get by ID => returns a single VisaRequestApiItem */
export const getVisaRequestById = async (
  id: number
): Promise<VisaRequestApiItem> => {
  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({ method: "GET" })
  );

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

const submitFormData = async (
  url: string,
  method: "POST" | "PUT",
  formData: FormData
): Promise<VisaRequestApiItem> => {
  const response = await fetch(
    url,
    withCredentials({
      method,
      headers: { Accept: "application/json" },
      body: formData,
    })
  );

  if (!response.ok) {
    await throwApiError(
      response,
      method === "POST"
        ? "Failed to create visa request"
        : "Failed to update visa request"
    );
  }

  return (await response.json()) as VisaRequestApiItem;
};

export const createVisaRequest = async (
  formValues: VisaRequestFormValues & { files?: File[] }
): Promise<VisaRequestApiItem> => {
  const isoDate =
    formValues.date && formValues.date.length === 10
      ? new Date(`${formValues.date}T00:00:00Z`).toISOString()
      : formValues.date ?? "";

  const visaIdNum = Number(formValues.visaId ?? 0);
  const quantityNum = Number(formValues.quantity ?? 1);

  const dto = {
    VisaId: visaIdNum,
    Quantity: quantityNum,
    Branch: String(formValues.branch ?? ""),
    Date: isoDate,
    AccountHolderName: String(formValues.accountHolderName ?? ""),
    AccountNumber:
      typeof formValues.accountNumber === "string"
        ? formValues.accountNumber
        : String(formValues.accountNumber ?? ""),
    NationalId:
      typeof formValues.nationalId === "string"
        ? formValues.nationalId
        : Number(formValues.nationalId ?? 0),
    PhoneNumberLinkedToNationalId: String(
      formValues.phoneNumberLinkedToNationalId ?? ""
    ),
    Cbl: String(formValues.cbl ?? ""),
    CardMovementApproval: String(formValues.cardMovementApproval ?? ""),
    CardUsingAcknowledgment: String(formValues.cardUsingAcknowledgment ?? ""),
    ForeignAmount: Number(formValues.foreignAmount ?? 0),
    LocalAmount: Number(formValues.localAmount ?? 0),
    Pldedge: String(formValues.pldedge ?? ""),
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

  return submitFormData(API_BASE, "POST", formData);
};

export const updateVisaRequest = async (
  id: number,
  formValues: VisaRequestFormValues & { files?: File[] }
): Promise<VisaRequestApiItem> => {
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

  return submitFormData(`${API_BASE}/${id}`, "PUT", formData);
};

/**
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
