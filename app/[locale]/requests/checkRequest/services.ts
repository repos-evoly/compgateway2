// app/[locale]/requests/checkRequest/services.ts
"use client";

import type {
  TCheckRequestFormValues,
  TCheckRequestsResponse,
  TCheckRequestValues,
} from "./types";
import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import { throwApiError } from "@/app/helpers/handleApiError";
import type { TKycResponse } from "@/app/auth/register/types";

/* ------------------------------------------------------------------ */
/* Config & helpers                                                    */
/* ------------------------------------------------------------------ */

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const init = (
  method: HttpMethod,
  bearer?: string,
  body?: unknown
): RequestInit => ({
  method,
  headers: {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
  },
  ...(body ? { body: JSON.stringify(body) } : {}),
  cache: "no-store",
});

/* Representatives list (for enriching representativeName) */
type RepresentativesList = {
  data: Array<{ id: number; name: string }>;
};

/* The allowed search fields for this resource */
export type CheckRequestSearchBy = "customer" | "status" | "rep";

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
  if (!baseUrl) throw new Error("Base API URL is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = new URL(`${baseUrl}/checkrequests`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (searchTerm) url.searchParams.set("searchTerm", searchTerm);
  if (searchBy) url.searchParams.set("searchBy", searchBy);

  let response = await fetch(url.toString(), init("GET", token));

  // Refresh once on 401
  if (response.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url.toString(), init("GET", token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch check requests.");
  }

  const data = (await response.json()) as TCheckRequestsResponse;

  // Enrich with representative names
  if (data.data?.length) {
    try {
      let repToken = getAccessTokenFromCookies();
      if (!repToken) throw new Error("No access token found for representatives.");

      const repsUrl = `${baseUrl}/representatives?page=1&limit=1000`;

      let repsRes = await fetch(repsUrl, init("GET", repToken));
      if (repsRes.status === 401 && repToken) {
        const refreshed = await refreshAuthTokens();
        repToken = refreshed.accessToken;
        repsRes = await fetch(repsUrl, init("GET", repToken));
      }
      if (!repsRes.ok) throw new Error(`Failed to fetch representatives.`);

      const repsData = (await repsRes.json()) as RepresentativesList;
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
    } catch {
      // do nothing if enrichment fails
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
  if (!baseUrl) throw new Error("Base API URL is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

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

  const url = `${baseUrl}/checkrequests`;

  let response = await fetch(url, init("POST", token, payload));
  if (response.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init("POST", token, payload));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(response, "Failed to create check request.");
  }

  const created = (await response.json()) as TCheckRequestValues;

  // Enrich with representative name
  if (created.representativeId) {
    try {
      let repToken = getAccessTokenFromCookies();
      if (!repToken) throw new Error("No access token found for representatives.");

      const repsUrl = `${baseUrl}/representatives?page=1&limit=1000`;

      let repsRes = await fetch(repsUrl, init("GET", repToken));
      if (repsRes.status === 401 && repToken) {
        const refreshed = await refreshAuthTokens();
        repToken = refreshed.accessToken;
        repsRes = await fetch(repsUrl, init("GET", repToken));
      }
      if (!repsRes.ok) throw new Error(`Failed to fetch representatives.`);

      const repsData = (await repsRes.json()) as RepresentativesList;
      const rep = repsData.data.find((r) => r.id === created.representativeId);
      if (rep) created.representativeName = rep.name;
    } catch {
      // ignore enrichment failure
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
  if (!baseUrl) throw new Error("Base API URL is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = `${baseUrl}/checkrequests/${id}`;

  let response = await fetch(url, init("GET", token));
  if (response.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init("GET", token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(response, `Failed to fetch check request by ID ${id}.`);
  }

  const data = (await response.json()) as TCheckRequestValues;

  // Enrich with representative name
  if (data.representativeId) {
    try {
      let repToken = getAccessTokenFromCookies();
      if (!repToken) throw new Error("No access token found for representatives.");

      const repsUrl = `${baseUrl}/representatives?page=1&limit=1000`;

      let repsRes = await fetch(repsUrl, init("GET", repToken));
      if (repsRes.status === 401 && repToken) {
        const refreshed = await refreshAuthTokens();
        repToken = refreshed.accessToken;
        repsRes = await fetch(repsUrl, init("GET", repToken));
      }
      if (!repsRes.ok) throw new Error(`Failed to fetch representatives.`);

      const repsData = (await repsRes.json()) as RepresentativesList;
      const rep = repsData.data.find((r) => r.id === data.representativeId);
      if (rep) data.representativeName = rep.name;
    } catch {
      // ignore enrichment failure
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
  if (!baseUrl) throw new Error("Base API URL is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

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

  const url = `${baseUrl}/checkrequests/${id}`;

  let response = await fetch(url, init("PUT", token, payload));
  if (response.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init("PUT", token, payload));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(
      response,
      `Failed to update check request with ID ${id}.`
    );
  }

  const updated = (await response.json()) as TCheckRequestValues;

  // Enrich with representative name
  if (updated.representativeId) {
    try {
      let repToken = getAccessTokenFromCookies();
      if (!repToken) throw new Error("No access token found for representatives.");

      const repsUrl = `${baseUrl}/representatives?page=1&limit=1000`;

      let repsRes = await fetch(repsUrl, init("GET", repToken));
      if (repsRes.status === 401 && repToken) {
        const refreshed = await refreshAuthTokens();
        repToken = refreshed.accessToken;
        repsRes = await fetch(repsUrl, init("GET", repToken));
      }
      if (!repsRes.ok) throw new Error(`Failed to fetch representatives.`);

      const repsData = (await repsRes.json()) as RepresentativesList;
      const rep = repsData.data.find((r) => r.id === updated.representativeId);
      if (rep) updated.representativeName = rep.name;
    } catch {
      // ignore enrichment failure
    }
  }

  return updated;
}

/**
 * Fetch KYC by company code.
 */
export async function getKycByCode(code: string): Promise<TKycResponse> {
  if (!baseUrl) throw new Error("Base API URL is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = `${baseUrl}/companies/kyc/${code}`;

  let response = await fetch(url, init("GET", token));
  if (response.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init("GET", token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch KYC data");
  }

  return (await response.json()) as TKycResponse;
}
