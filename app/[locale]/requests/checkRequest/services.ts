// app/[locale]/requests/checkRequest/services.ts
"use client";

import type {
  TCheckRequestFormValues,
  TCheckRequestsResponse,
  TCheckRequestValues,
} from "./types";
import { handleApiResponse } from "@/app/helpers/apiResponse";
import type { TKycResponse } from "@/app/auth/register/types";

/* ------------------------------------------------------------------ */
/* Config & helpers                                                    */
/* ------------------------------------------------------------------ */

const API_BASE = "/Companygw/api/requests/check-request" as const;
const REPRESENTATIVES_API = "/Companygw/api/representatives" as const;
const KYC_API_BASE = "/Companygw/api/companies/kyc" as const;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});

const init = (method: HttpMethod, body?: unknown): RequestInit =>
  withCredentials(
    body
      ? {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : { method }
  );

/* Representatives list (for enriching representativeName) */
type RepresentativesList = {
  data: Array<{ id: number; name: string }>;
};

/* The allowed search fields for this resource */
export type CheckRequestSearchBy = "customer" | "status" | "rep";

const buildListUrl = (
  page: number,
  limit: number,
  searchTerm: string,
  searchBy: "" | CheckRequestSearchBy
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

const fetchRepresentatives = async (): Promise<RepresentativesList | null> => {
  try {
    const res = await fetch(
      `${REPRESENTATIVES_API}?page=1&limit=1000`,
      withCredentials({ method: "GET" })
    );
    return await handleApiResponse<RepresentativesList | null>(
      res,
      "Failed to fetch representatives"
    );
  } catch {
    return null;
  }
};

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

/**
 * Fetch paginated check requests with optional search.
 * - searchBy must be one of: "customer" | "status" | "rep"
 */
export async function getCheckRequests(
  page: number,
  limit: number,
  searchTerm: string = "",
  searchBy: "" | CheckRequestSearchBy = ""
): Promise<TCheckRequestsResponse> {
  const response = await fetch(
    buildListUrl(page, limit, searchTerm, searchBy),
    withCredentials({ method: "GET" })
  );

  const data = await handleApiResponse<TCheckRequestsResponse>(
    response,
    "Failed to fetch check requests."
  );

  // Enrich with representative names
  if (data.data?.length) {
    const repsData = await fetchRepresentatives();
    if (repsData) {
      const repMap = new Map<number, string>(
        repsData.data.map((r) => [r.id, r.name])
      );
      data.data = data.data.map((cr) => ({
        ...cr,
        representativeName:
          typeof cr.representativeId === "number"
            ? repMap.get(cr.representativeId) ?? `ID: ${cr.representativeId}`
            : cr.representativeName,
      }));
    }
  }

  return data;
}

/**
 * Create a check request.
 */
export async function createCheckRequest(
  values: TCheckRequestFormValues
): Promise<TCheckRequestValues> {
  const payload = {
    branch: values.branch,
    branchNum: values.branchNum,
    date: values.date.toISOString(),
    customerName: values.customerName,
    cardNum: values.cardNum,
    accountNum: values.accountNum,
    beneficiary: values.beneficiary,
    phone: values.phone,
    representativeId:
      values.representativeId != null
        ? Number(values.representativeId)
        : undefined,
    lineItems: values.lineItems.map((item) => ({
      dirham: String(item.dirham ?? ""),
      lyd: String(item.lyd ?? ""),
    })),
  };

  const response = await fetch(API_BASE, init("POST", payload));

  const created = await handleApiResponse<TCheckRequestValues>(
    response,
    "Failed to create check request."
  );

  // Enrich with representative name
  if (created.representativeId) {
    const repsData = await fetchRepresentatives();
    if (repsData) {
      const rep = repsData.data.find((r) => r.id === created.representativeId);
      if (rep) created.representativeName = rep.name;
    }
  }

  return created;
}

/**
 * Fetch one check request by ID.
 */
export async function getCheckRequestById(
  id: string | number
): Promise<TCheckRequestValues> {
  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({ method: "GET" })
  );

  const data = await handleApiResponse<TCheckRequestValues>(
    response,
    `Failed to fetch check request by ID ${id}.`
  );

  // Enrich with representative name
  if (data.representativeId) {
    const repsData = await fetchRepresentatives();
    if (repsData) {
      const rep = repsData.data.find((r) => r.id === data.representativeId);
      if (rep) data.representativeName = rep.name;
    }
  }

  return data;
}

/**
 * Update a check request by ID.
 */
export async function updateCheckRequestById(
  id: string | number,
  values: TCheckRequestFormValues
): Promise<TCheckRequestValues> {
  const payload = {
    branch: values.branch,
    date: values.date.toISOString(),
    customerName: values.customerName,
    cardNum: values.cardNum,
    accountNum: values.accountNum,
    beneficiary: values.beneficiary,
    representativeId: values.representativeId,
    lineItems: values.lineItems.map((item) => ({
      dirham: item.dirham,
      lyd: item.lyd,
    })),
  };

  const response = await fetch(`${API_BASE}/${id}`, init("PUT", payload));

  const updated = await handleApiResponse<TCheckRequestValues>(
    response,
    `Failed to update check request with ID ${id}.`
  );

  // Enrich with representative name
  if (updated.representativeId) {
    const repsData = await fetchRepresentatives();
    if (repsData) {
      const rep = repsData.data.find((r) => r.id === updated.representativeId);
      if (rep) updated.representativeName = rep.name;
    }
  }

  return updated;
}

/**
 * Fetch KYC by company code.
 */
export async function getKycByCode(code: string): Promise<TKycResponse> {
  const response = await fetch(`${KYC_API_BASE}/${code}`, {
    method: "GET",
    cache: "no-store",
  });

  return handleApiResponse<TKycResponse>(
    response,
    "Failed to fetch KYC data"
  );
}
