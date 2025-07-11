"use client";
import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler"; // adjust path as needed
import { TCblRequestsResponse, TCBLValues } from "./types";
import { throwApiError } from "@/app/helpers/handleApiError";      // ← NEW
import { TKycResponse } from "@/app/auth/register/types";
import { mergeFilesToPdf } from "@/app/components/reusable/DocumentUploader";


/** Minimal shape of an "official" from the API */
type TApiOfficial = {
  id: number;          // if your API includes an "id," otherwise remove
  name: string;
  position: string;
};

/** Minimal shape of a "signature" from the API */
type TApiSignature = {
  id: number;          // if your API includes an "id," otherwise remove
  name: string;
  signature: string;
  status?: string;     // or remove if your API doesn't return "status"
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
  officials?: TApiOfficial[];
  signatures?: TApiSignature[];
};

// Grab the token at module-level once. (If your logic must handle token refresh, adapt accordingly.)
const token = getAccessTokenFromCookies();

/**
 * Fetch a list of CBL requests from the API, with optional pagination and search.
 */
export async function getCblRequests(
  page: number,
  limit: number,
  searchTerm: string,
  searchBy: string
): Promise<TCblRequestsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${baseUrl}/cblrequests`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  if (searchTerm) {
    url.searchParams.set("searchTerm", searchTerm);
  }
  if (searchBy) {
    url.searchParams.set("searchBy", searchBy);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    await throwApiError(response, "Failed to fetch CBL requests.");
  }

  // The response shape matches TCblRequestsResponse exactly
  return (await response.json()) as TCblRequestsResponse;
}

export async function addCblRequest(
  values: TCBLValues & { files?: File[] }
): Promise<TCBLValues> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  const token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  /* ---------- 1 · build JSON payload ---------- */
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

  /* ---------- 2 · FormData ---------- */
  const formData = new FormData();
  formData.append("Dto", JSON.stringify(dto)); // key MUST be "Dto"

  const files = values.files ?? [];
  if (files.length > 1) {
    const { blob } = await mergeFilesToPdf(files, 5); // 5 MB cap
    formData.append("files", blob, "documents.pdf");
  } else if (files.length === 1) {
    formData.append("files", files[0], files[0].name);
  }

  /* ---------- 3 · POST ---------- */
  const response = await fetch(`${baseUrl}/cblrequests`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to create CBL.");
  }

  return (await response.json()) as TCBLValues;
}

/**
 * Fetch KYC data by company code (6 digits after first 4 digits of account number)
 */
export async function getKycByCode(code: string): Promise<TKycResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";
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

/**
 * Fetch a single CBL request by ID (GET /cblrequests/{id}).
 * Converts the API's ISO date strings into JavaScript Date objects,
 * and maps `officials` -> table1Data, `signatures` -> table2Data.
 */
export async function getCblRequestById(id: string | number): Promise<TCBLValues> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const response = await fetch(`${baseUrl}/cblrequests/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await throwApiError(
      response,
      `Failed to fetch CBL request by ID ${id}.`
    );
  }

  // Raw data from the API
  const data = (await response.json()) as TApiCblRequest;

  // Helper to parse a possibly-null ISO string into a JS Date or null
  const parseDate = (isoString?: string | null) =>
    isoString ? new Date(isoString) : null;

  // Convert the API shape to our TCBLValues shape
  const cblValues: TCBLValues = {
    id: data.id,
    partyName: data.partyName,
    capital: data.capital,
    foundingDate: parseDate(data.foundingDate) ?? new Date(),
    legalForm: data.legalForm,
    branchOrAgency: data.branchOrAgency,
    currentAccount: data.currentAccount,
    accountOpening: parseDate(data.accountOpening) ?? new Date(),
    commercialLicense: data.commercialLicense,
    validatyLicense: parseDate(data.validatyLicense) ?? new Date(),
    commercialRegistration: data.commercialRegistration,
    validatyRegister: parseDate(data.validatyRegister) ?? new Date(),
    statisticalCode: data.statisticalCode,
    validatyCode: parseDate(data.validatyCode) ?? new Date(),
    chamberNumber: data.chamberNumber,
    validatyChamber: parseDate(data.validatyChamber) ?? new Date(),
    taxNumber: data.taxNumber,
    office: data.office,
    legalRepresentative: data.legalRepresentative,
    representativeNumber: data.representativeNumber,
    birthDate: parseDate(data.birthDate) ?? new Date(),
    passportNumber: data.passportNumber,
    passportIssuance: parseDate(data.passportIssuance) ?? new Date(),
    passportExpiry: parseDate(data.passportExpiry) ?? new Date(),
    mobile: data.mobile,
    address: data.address,
    packingDate: parseDate(data.packingDate) ?? new Date(),
    specialistName: data.specialistName,
    status: data.status,

    // Convert "officials" -> "table1Data"
    table1Data:
      data.officials?.map((off) => ({
        name: off.name,
        position: off.position,
      })) ?? [],

    // Convert "signatures" -> "table2Data"
    table2Data:
      data.signatures?.map((sig) => ({
        name: sig.name,
        signature: sig.signature,
      })) ?? [],
  };

  return cblValues;
}

/**
 * Update (PUT) an existing CBL request by ID.
 */
export async function updateCblRequest(id: string | number, values: TCBLValues) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined in .env");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  // Convert your form values to API payload shape
  const payload = {
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

    // Convert table1Data -> officials
    officials: values.table1Data.map((off) => ({
      id: 0, // or omit if unnecessary
      name: off.name,
      position: off.position,
    })),

    // Convert table2Data -> signatures
    signatures: values.table2Data.map((sig) => ({
      id: 0, // or omit if unnecessary
      name: sig.name,
      signature: sig.signature,
      status: "string", // or omit / adapt if your API doesn't need this
    })),
  };

  const response = await fetch(`${baseUrl}/cblrequests/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to update CBL request.");
  }

  // Return whatever your API returns (assuming it returns the updated resource).
  return (await response.json()) as TCBLValues;
}
