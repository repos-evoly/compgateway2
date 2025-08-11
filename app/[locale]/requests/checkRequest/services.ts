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

/* Use the same base used across the app; falls back to the fixed IP if env missing */
const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";

/* Helper to build RequestInit with optional bearer */
const init = (method: "GET" | "POST" | "PUT" | "DELETE", bearer?: string, body?: unknown): RequestInit => ({
  method,
  headers: {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
  },
  ...(body ? { body: JSON.stringify(body) } : {}),
  cache: "no-store",
});

/* Minimal type for representatives list used to map names */
type RepresentativesList = {
  data: Array<{ id: number; name: string }>;
};

/**
 * Fetch all check requests (GET), with optional pagination & search.
 * - Reads token at call time
 * - On 401, refreshes once and retries
 * - Also fetches representatives to annotate representativeName
 */
export async function getCheckRequests(
  page: number,
  limit: number,
  searchTerm: string = "",
  searchBy: string = ""
): Promise<TCheckRequestsResponse> {
  if (!baseUrl) {
    throw new Error("Base API URL is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = new URL(`${baseUrl}/checkrequests`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (searchTerm) url.searchParams.set("searchTerm", searchTerm);
  if (searchBy) url.searchParams.set("searchBy", searchBy);

  // First attempt
  let response = await fetch(url.toString(), init("GET", token));

  // Refresh + retry once on 401
  if (response.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url.toString(), init("GET", token));
    } catch {
      // fall through to error handling
    }
  }

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch check requests.");
  }

  const data = (await response.json()) as TCheckRequestsResponse;

  // Optionally enrich with representative names
  if (data.data && data.data.length > 0) {
    try {
      // Use latest token from cookies (might have been refreshed)
      let repToken = getAccessTokenFromCookies();
      if (!repToken) throw new Error("No access token found for representatives.");

      const repsUrl = `${baseUrl}/representatives?page=1&limit=1000`;

      let repsRes = await fetch(repsUrl, init("GET", repToken));
      if (repsRes.status === 401 && repToken) {
        const refreshed = await refreshAuthTokens();
        repToken = refreshed.accessToken;
        repsRes = await fetch(repsUrl, init("GET", repToken));
      }

      if (!repsRes.ok) throw new Error(`Failed to fetch representatives. Status: ${repsRes.status}`);

      const repsData = (await repsRes.json()) as RepresentativesList;
      const map = new Map<number, string>(repsData.data.map((r) => [r.id, r.name]));

      data.data = data.data.map((cr) => ({
        ...cr,
        representativeName:
          typeof cr.representativeId === "number"
            ? map.get(cr.representativeId) ?? `ID: ${cr.representativeId}`
            : undefined,
      }));
    } catch {
      // silently continue without representative names
    }
  }

  return data;
}

/**
 * Creates a new check request (POST)
 * - On 401, refresh once and retry
 * - Enrich response with representativeName if available
 */
export async function createCheckRequest(values: TCheckRequestFormValues): Promise<TCheckRequestValues> {
  if (!baseUrl) {
    throw new Error("Base API URL is not defined");
  }

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

  const responseData = (await response.json()) as TCheckRequestValues;

  // Enrich with representative name if possible
  if (responseData.representativeId) {
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

      if (!repsRes.ok) throw new Error(`Failed to fetch representatives. Status: ${repsRes.status}`);

      const repsData = (await repsRes.json()) as RepresentativesList;
      const rep = repsData.data.find((r) => r.id === responseData.representativeId);
      if (rep) {
        responseData.representativeName = rep.name;
      }
    } catch {
      // ignore representative name enrichment failure
    }
  }

  return responseData;
}

/**
 * Fetch a single check request by ID (GET)
 * - On 401, refresh once and retry
 * - Enrich with representativeName if available
 */
export async function getCheckRequestById(id: string | number): Promise<TCheckRequestValues> {
  if (!baseUrl) {
    throw new Error("Base API URL is not defined");
  }

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

      if (!repsRes.ok) throw new Error(`Failed to fetch representatives. Status: ${repsRes.status}`);

      const repsData = (await repsRes.json()) as RepresentativesList;
      const rep = repsData.data.find((r) => r.id === data.representativeId);
      if (rep) {
        data.representativeName = rep.name;
      }
    } catch {
      // ignore enrichment failure
    }
  }

  return data;
}

/**
 * Updates a check request (PUT) with all the data fields.
 * - On 401, refresh once and retry
 * - Enrich with representativeName if available
 */
export async function updateCheckRequestById(
  id: string | number,
  values: TCheckRequestFormValues
): Promise<TCheckRequestValues> {
  if (!baseUrl) {
    throw new Error("Base API URL is not defined");
  }

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
    await throwApiError(response, `Failed to update check request with ID ${id}.`);
  }

  const responseData = (await response.json()) as TCheckRequestValues;

  if (responseData.representativeId) {
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

      if (!repsRes.ok) throw new Error(`Failed to fetch representatives. Status: ${repsRes.status}`);

      const repsData = (await repsRes.json()) as RepresentativesList;
      const rep = repsData.data.find((r) => r.id === responseData.representativeId);
      if (rep) {
        responseData.representativeName = rep.name;
      }
    } catch {
      // ignore enrichment failure
    }
  }

  return responseData;
}

/**
 * Fetch KYC data by company code (6 digits after first 4 digits of account number)
 * - On 401, refresh once and retry
 */
export async function getKycByCode(code: string): Promise<TKycResponse> {
  if (!baseUrl) {
    throw new Error("Base API URL is not defined");
  }

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
