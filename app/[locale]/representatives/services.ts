"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import { throwApiError } from "@/app/helpers/handleApiError";
import type {
  RepresentativesResponse,
  Representative,
  RepresentativeFormValues,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;

/**
 * GET /representatives
 */
export const getRepresentatives = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<RepresentativesResponse> => {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = new URL(`${BASE_URL}/representatives`);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());
  if (search) url.searchParams.set("search", search);

  const init = (bearer?: string): RequestInit => ({
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    cache: "no-store",
  });

  let res = await fetch(url.toString(), init(token));

  // Refresh only on 401
  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url.toString(), init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch representatives");
  }

  const data = (await res.json()) as RepresentativesResponse;
  return data;
};

/**
 * POST /representatives
 * FormData upload (photo optional)
 */
export const createRepresentative = async (
  values: RepresentativeFormValues
): Promise<Representative> => {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const formData = new FormData();
  formData.append("Name", values.name);
  formData.append("Number", values.number);
  formData.append("PassportNumber", values.passportNumber);
  formData.append("IsActive", String(values.isActive));
  if (values.photo && values.photo[0]) {
    formData.append("Photo", values.photo[0]);
  }

  const url = `${BASE_URL}/representatives`;

  const init = (bearer?: string): RequestInit => ({
    method: "POST",
    headers: {
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: formData,
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) await throwApiError(res, "Failed to create representative");
  return (await res.json()) as Representative;
};

/**
 * PUT /representatives/{id}
 * FormData upload (photo optional)
 */
export const updateRepresentative = async (
  id: number,
  values: RepresentativeFormValues
): Promise<Representative> => {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const formData = new FormData();
  formData.append("Name", values.name);
  formData.append("Number", values.number);
  formData.append("PassportNumber", values.passportNumber);
  formData.append("IsActive", String(values.isActive));
  if (values.photo && values.photo[0]) {
    formData.append("Photo", values.photo[0]);
  }

  const url = `${BASE_URL}/representatives/${id}`;

  const init = (bearer?: string): RequestInit => ({
    method: "PUT",
    headers: {
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: formData,
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) await throwApiError(res, "Failed to update representative");
  return (await res.json()) as Representative;
};

/**
 * GET /representatives/{id}
 */
export const getRepresentativeById = async (
  id: number
): Promise<Representative> => {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = `${BASE_URL}/representatives/${id}`;

  const init = (bearer?: string): RequestInit => ({
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch representative by ID");
  }

  return (await res.json()) as Representative;
};

/**
 * DELETE /representatives/{id}
 */
export const deleteRepresentative = async (id: number): Promise<void> => {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  let token = getAccessTokenFromCookies();
  if (!token) throw new Error("No access token found in cookies");

  const url = `${BASE_URL}/representatives/${id}`;

  const init = (bearer?: string): RequestInit => ({
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to delete representative");
  }

  return;
};

/**
 * Toggle representative active/inactive status
 * (fetch current, compute new status, PUT JSON)
 */
/**
 * Toggle representative active/inactive status
 * Reuses updateRepresentative (multipart/form-data).
 */
export const toggleRepresentativeStatus = async (
  id: number
): Promise<Representative> => {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  // Fetch current state first
  const current = await getRepresentativeById(id);

  // Prepare values for update (no photo change)
  const nextValues: RepresentativeFormValues = {
    name: current.name,
    number: current.number,
    passportNumber: current.passportNumber ?? "",
    isActive: !current.isActive,
    // photo is optional and omitted here
  };

  // This sends multipart/form-data with correct field names:
  // Name, Number, PassportNumber, IsActive
  const updated = await updateRepresentative(id, nextValues);
  return updated;
};

