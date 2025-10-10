"use client";

import { handleApiResponse } from "@/app/helpers/apiResponse";
import type { TKycResponse } from "@/app/auth/register/types";
import { mergeFilesToPdf } from "@/app/components/reusable/DocumentUploader";
import type {
  TCblRequestsResponse,
  TCBLValues,
  Attachment,
} from "./types";

/** Minimal shape of an "official" from the API */
type TApiOfficial = {
  id: number;
  name: string;
  position: string;
};

/** Minimal shape of a "signature" from the API */
type TApiSignature = {
  id: number;
  name: string;
  signature: string;
  status?: string;
};

/** Full shape of the API response for a single CBL request */
type TApiCblRequest = {
  id: number;
  partyName: string;
  capital: number;
  foundingDate?: string | null;
  legalForm: string;
  branchOrAgency: string;
  currentAccount: string;
  accountOpening?: string | null;
  commercialLicense: string;
  validatyLicense?: string | null;
  commercialRegistration: string;
  validatyRegister?: string | null;
  statisticalCode: string;
  validatyCode?: string | null;
  chamberNumber: string;
  validatyChamber?: string | null;
  taxNumber: string;
  office: string;
  legalRepresentative: string;
  representativeNumber: string;
  birthDate?: string | null;
  passportNumber: string;
  passportIssuance?: string | null;
  passportExpiry?: string | null;
  mobile: string;
  address: string;
  packingDate?: string | null;
  specialistName: string;
  status?: string;
  attachmentId?: string | null;
  attachment?: unknown | null;
  attachments?: Attachment[];
  officials?: TApiOfficial[];
  signatures?: TApiSignature[];
};

const API_BASE = "/Companygw/api/requests/cbl" as const;
const KYC_API_BASE = "/Companygw/api/companies/kyc" as const;
const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});
const baseImgUrl = (process.env.NEXT_PUBLIC_IMAGE_URL || "").replace(/\/$/, "");

/* ---------- helpers ---------- */
const parseDate = (iso?: string | null) => (iso ? new Date(iso) : null);

const buildListUrl = (
  page: number,
  limit: number,
  searchTerm: string,
  searchBy: string
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

function toTCBLValues(api: TApiCblRequest): TCBLValues {
  return {
    id: api.id,
    partyName: api.partyName,
    capital: api.capital,
    foundingDate: parseDate(api.foundingDate) ?? new Date(),
    legalForm: api.legalForm,
    branchOrAgency: api.branchOrAgency,
    currentAccount: api.currentAccount,
    accountOpening: parseDate(api.accountOpening) ?? new Date(),
    commercialLicense: api.commercialLicense,
    validatyLicense: parseDate(api.validatyLicense) ?? new Date(),
    commercialRegistration: api.commercialRegistration,
    validatyRegister: parseDate(api.validatyRegister) ?? new Date(),
    statisticalCode: api.statisticalCode,
    validatyCode: parseDate(api.validatyCode) ?? new Date(),
    chamberNumber: api.chamberNumber,
    validatyChamber: parseDate(api.validatyChamber) ?? new Date(),
    taxNumber: api.taxNumber,
    office: api.office,
    legalRepresentative: api.legalRepresentative,
    representativeNumber: api.representativeNumber,
    birthDate: parseDate(api.birthDate) ?? new Date(),
    passportNumber: api.passportNumber,
    passportIssuance: parseDate(api.passportIssuance) ?? new Date(),
    passportExpiry: parseDate(api.passportExpiry) ?? new Date(),
    mobile: api.mobile,
    address: api.address,
    packingDate: parseDate(api.packingDate) ?? new Date(),
    specialistName: api.specialistName,
    status: api.status,
    table1Data:
      api.officials?.map((o) => ({
        name: o.name,
        position: o.position,
      })) ?? [],
    table2Data:
      api.signatures?.map((s) => ({
        name: s.name,
        signature: s.signature,
      })) ?? [],
    attachments: api.attachments || [],
    attachmentUrls:
      api.attachments?.map((att) => {
        const path = String(att.attUrl || "").replace(/^\//, "");
        return baseImgUrl ? `${baseImgUrl}/${path}` : path;
      }) ?? [],
  };
}

const sendFormData = async (
  url: string,
  method: "POST" | "PUT",
  formData: FormData,
  errorMessage: string
): Promise<TApiCblRequest> => {
  const response = await fetch(
    url,
    withCredentials({
      method,
      headers: { Accept: "application/json" },
      body: formData,
    })
  );

  return handleApiResponse<TApiCblRequest>(response, errorMessage);
};

/**
 * Fetch a list of CBL requests from the API, with optional pagination and search.
 */
export async function getCblRequests(
  page: number,
  limit: number,
  searchTerm: string,
  searchBy: string
): Promise<TCblRequestsResponse> {
  const response = await fetch(
    buildListUrl(page, limit, searchTerm, searchBy),
    withCredentials({ method: "GET" })
  );

  return handleApiResponse<TCblRequestsResponse>(
    response,
    "Failed to fetch CBL requests."
  );
}

export async function addCblRequest(
  values: TCBLValues & { files?: File[] }
): Promise<TCBLValues> {
  const dto = {
    partyName: values.partyName,
    capital: values.capital as number,
    foundingDate: values.foundingDate?.toISOString() ?? null,
    legalForm: values.legalForm,
    branchOrAgency: values.branchOrAgency,
    currentAccount: values.currentAccount,
    accountOpening: values.accountOpening?.toISOString() ?? null,
    commercialLicense: values.commercialLicense,
    validatyLicense: values.validatyLicense?.toISOString() ?? null,
    commercialRegistration: values.commercialRegistration,
    validatyRegister: values.validatyRegister?.toISOString() ?? null,
    statisticalCode: values.statisticalCode,
    validatyCode: values.validatyCode?.toISOString() ?? null,
    chamberNumber: values.chamberNumber,
    validatyChamber: values.validatyChamber?.toISOString() ?? null,
    taxNumber: values.taxNumber,
    office: values.office,
    legalRepresentative: values.legalRepresentative,
    representativeNumber: values.representativeNumber,
    birthDate: values.birthDate?.toISOString() ?? null,
    passportNumber: values.passportNumber,
    passportIssuance: values.passportIssuance?.toISOString() ?? null,
    passportExpiry: values.passportExpiry?.toISOString() ?? null,
    mobile: values.mobile,
    address: values.address,
    packingDate: values.packingDate?.toISOString() ?? null,
    specialistName: values.specialistName,
    officials: values.table1Data.map((o) => ({
      id: 0,
      name: o.name,
      position: o.position,
    })),
    signatures: values.table2Data.map((s) => ({
      id: 0,
      name: s.name,
      signature: s.signature,
      status: "string",
    })),
  };

  const formData = new FormData();
  formData.append("Dto", JSON.stringify(dto));

  const files = values.files ?? [];
  if (files.length > 1) {
    const { blob } = await mergeFilesToPdf(files, 5);
    formData.append("files", blob, "documents.pdf");
  } else if (files.length === 1) {
    formData.append("files", files[0], files[0].name);
  }

  const api = await sendFormData(
    API_BASE,
    "POST",
    formData,
    "Failed to create CBL."
  );

  return toTCBLValues(api);
}

/**
 * Fetch KYC data by company code (6 digits after first 4 digits of account number)
 */
export async function getKycByCode(code: string): Promise<TKycResponse> {
  const response = await fetch(
    `${KYC_API_BASE}/${code}`,
    withCredentials({ method: "GET" })
  );

  return handleApiResponse<TKycResponse>(
    response,
    "Failed to fetch KYC data"
  );
}

/**
 * Fetch a single CBL request by ID (GET /cblrequests/{id}).
 * Converts the API's ISO dates into JS Dates and maps nested arrays.
 */
export async function getCblRequestById(id: string | number): Promise<TCBLValues> {
  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({ method: "GET" })
  );

  const api = await handleApiResponse<TApiCblRequest>(
    response,
    `Failed to fetch CBL request by ID ${id}.`
  );
  return toTCBLValues(api);
}

/**
 * Update (PUT) an existing CBL request by ID.
 */
export async function updateCblRequest(
  id: string | number,
  values: TCBLValues & { files?: File[]; newFiles?: File[] }
): Promise<TCBLValues> {
  const dto = {
    partyName: values.partyName,
    capital: values.capital,
    foundingDate: values.foundingDate?.toISOString() ?? null,
    legalForm: values.legalForm,
    branchOrAgency: values.branchOrAgency,
    currentAccount: values.currentAccount,
    accountOpening: values.accountOpening?.toISOString() ?? null,
    commercialLicense: values.commercialLicense,
    validatyLicense: values.validatyLicense?.toISOString() ?? null,
    commercialRegistration: values.commercialRegistration,
    validatyRegister: values.validatyRegister?.toISOString() ?? null,
    statisticalCode: values.statisticalCode,
    validatyCode: values.validatyCode?.toISOString() ?? null,
    chamberNumber: values.chamberNumber,
    validatyChamber: values.validatyChamber?.toISOString() ?? null,
    taxNumber: values.taxNumber,
    office: values.office,
    legalRepresentative: values.legalRepresentative,
    representativeNumber: values.representativeNumber,
    birthDate: values.birthDate?.toISOString() ?? null,
    passportNumber: values.passportNumber,
    passportIssuance: values.passportIssuance?.toISOString() ?? null,
    passportExpiry: values.passportExpiry?.toISOString() ?? null,
    mobile: values.mobile,
    address: values.address,
    packingDate: values.packingDate?.toISOString() ?? null,
    specialistName: values.specialistName,
    officials: values.table1Data.map((off) => ({
      id: 0,
      name: off.name,
      position: off.position,
    })),
    signatures: values.table2Data.map((sig) => ({
      id: 0,
      name: sig.name,
      signature: sig.signature,
      status: "string",
    })),
  };

  const formData = new FormData();
  formData.append("Dto", JSON.stringify(dto));

  const allFiles = [...(values.files || []), ...(values.newFiles || [])];
  if (allFiles.length > 1) {
    const { blob } = await mergeFilesToPdf(allFiles, 5);
    formData.append("files", blob, "documents.pdf");
  } else if (allFiles.length === 1) {
    formData.append("files", allFiles[0], allFiles[0].name);
  }

  const api = await sendFormData(
    `${API_BASE}/${id}`,
    "PUT",
    formData,
    "Failed to update CBL request."
  );

  return toTCBLValues(api);
}
