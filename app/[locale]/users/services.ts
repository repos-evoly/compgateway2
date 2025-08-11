// app/services/employees/services.ts
"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import Cookies from "js-cookie";
import type {
  CompanyEmployee,
  CompanyPermissions,
  CreateEmployeePayload,
  RoleOption,
  UserPermissions,
  EditEmployeePayload,
} from "./types";
import { throwApiError } from "@/app/helpers/handleApiError";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;

const sanitize = (v: string): string => decodeURIComponent(v).replace(/^"|"$/g, "");
const shouldRefresh = (status: number): boolean => status === 401 || status === 403;

/**
 * Gets the company code from cookies, decoding any '%22' quotes at the start/end.
 * If the cookie is something like '%22725010%22', decode => '"725010"' => strip => '725010'.
 */
function getCompanyCodeFromCookies(): string {
  const raw = Cookies.get("companyCode");
  if (!raw) {
    throw new Error("No companyCode cookie found");
  }
  const stripped = sanitize(raw);
  if (!stripped) {
    throw new Error("Empty or invalid companyCode after stripping quotes");
  }
  return stripped;
}

const authHeaders = (bearer: string, companyCode?: string): HeadersInit => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${sanitize(bearer)}`,
  ...(companyCode ? { "X-Company-Code": companyCode, "Company-Code": companyCode } : {}),
});

/**
 * GET /companies/{companyCode}/users
 */
export async function getEmployees(): Promise<CompanyEmployee[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }
  token = sanitize(token);

  const companyCode = getCompanyCodeFromCookies();
  const url = `${BASE_URL}/companies/${encodeURIComponent(companyCode)}/users`;

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: authHeaders(bearer, companyCode),
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch employees.");
  }

  const data = (await res.json()) as CompanyEmployee[];
  return data;
}

/**
 * GET /companies/{companyCode}/users/{userId}
 */
export async function getEmployeeById(
  userId: string | number
): Promise<CompanyEmployee> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }
  token = sanitize(token);

  const companyCode = getCompanyCodeFromCookies();
  const url = `${BASE_URL}/companies/${encodeURIComponent(
    companyCode
  )}/users/${userId}`;

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: authHeaders(bearer, companyCode),
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch employees.");
  }

  const data = (await res.json()) as CompanyEmployee;
  return data;
}

/**
 * POST /companies/{companyCode}/users
 */
export async function createEmployee(
  payload: CreateEmployeePayload
): Promise<CompanyEmployee> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }
  token = sanitize(token);

  const companyCode = getCompanyCodeFromCookies();
  const url = `${BASE_URL}/companies/${encodeURIComponent(companyCode)}/users`;

  const init = (bearer: string): RequestInit => ({
    method: "POST",
    headers: authHeaders(bearer, companyCode),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to create employees.");
  }

  const data = (await res.json()) as CompanyEmployee;
  return data;
}

/**
 * PUT /companies/{companyCode}/users/{userId}
 */
export async function editEmployee(
  userId: number,
  payload: EditEmployeePayload
): Promise<CompanyEmployee> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }
  token = sanitize(token);

  const companyCode = getCompanyCodeFromCookies();
  const url = `${BASE_URL}/companies/${encodeURIComponent(
    companyCode
  )}/users/${userId}`;

  const init = (bearer: string): RequestInit => ({
    method: "PUT",
    headers: authHeaders(bearer, companyCode),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to edit employees.");
  }

  const responseText = await res.text();

  let data: CompanyEmployee;
  if (responseText && responseText.trim()) {
    try {
      data = JSON.parse(responseText) as CompanyEmployee;
    } catch {
      data = {
        id: userId,
        authUserId: 0,
        companyCode: companyCode,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        roleId: payload.roleId,
        permissions: [],
        isActive: payload.isActive,
      };
    }
  } else {
    data = {
      id: userId,
      authUserId: 0,
      companyCode: companyCode,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      roleId: payload.roleId,
      permissions: [],
      isActive: payload.isActive,
    };
  }

  return data;
}

/**
 * Toggle employee active/inactive status
 */
export async function toggleEmployeeStatus(
  id: number
): Promise<CompanyEmployee> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }
  token = sanitize(token);

  const currentEmployee = await getEmployeeById(id);
  const newStatus = !currentEmployee.isActive;
  const supportsIsActive = currentEmployee.isActive !== undefined;

  const updatedData: EditEmployeePayload & { isActive?: boolean } = {
    firstName: currentEmployee.firstName,
    lastName: currentEmployee.lastName,
    email: currentEmployee.email,
    phone: currentEmployee.phone,
    roleId: currentEmployee.roleId,
    ...(supportsIsActive ? { isActive: newStatus } : {}),
  };

  const companyCode = getCompanyCodeFromCookies();
  const url = `${BASE_URL}/companies/${encodeURIComponent(
    companyCode
  )}/users/${id}`;

  const init = (bearer: string): RequestInit => ({
    method: "PUT",
    headers: authHeaders(bearer, companyCode),
    body: JSON.stringify(updatedData),
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
    await throwApiError(response, "Failed to toggle employee status");
  }

  const responseText = await response.text();

  let result: unknown;
  if (responseText && responseText.trim()) {
    try {
      result = JSON.parse(responseText) as unknown;
    } catch {
      result = {};
    }
  } else {
    result = {};
  }

  let finalResult: CompanyEmployee;
  if (typeof result === "object" && result !== null && "isActive" in result) {
    finalResult = result as CompanyEmployee;
  } else if (supportsIsActive) {
    finalResult = {
      id: (result as Partial<CompanyEmployee>).id || currentEmployee.id,
      authUserId:
        (result as Partial<CompanyEmployee>).authUserId ||
        currentEmployee.authUserId,
      companyCode:
        (result as Partial<CompanyEmployee>).companyCode ||
        currentEmployee.companyCode,
      firstName:
        (result as Partial<CompanyEmployee>).firstName ||
        currentEmployee.firstName,
      lastName:
        (result as Partial<CompanyEmployee>).lastName ||
        currentEmployee.lastName,
      username:
        (result as Partial<CompanyEmployee>).username ||
        currentEmployee.username,
      email:
        (result as Partial<CompanyEmployee>).email || currentEmployee.email,
      phone:
        (result as Partial<CompanyEmployee>).phone || currentEmployee.phone,
      roleId:
        (result as Partial<CompanyEmployee>).roleId || currentEmployee.roleId,
      permissions:
        (result as Partial<CompanyEmployee>).permissions ||
        currentEmployee.permissions,
      isActive: newStatus,
    };
  } else {
    finalResult = {
      ...currentEmployee,
      isActive: true,
    };
  }

  return finalResult;
}

export async function getRoles(): Promise<RoleOption[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }
  token = sanitize(token);

  const url = `${BASE_URL}/users/roles?isGlobal=false`;

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: {
      ...authHeaders(bearer),
    },
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch roles.");
  }

  const data = (await res.json()) as RoleOption[];
  return data;
}

export async function getPermissionsByUserId(
  userId: string
): Promise<UserPermissions[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }
  token = sanitize(token);

  const url = `${BASE_URL}/users/${userId}/permissions`;

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: {
      ...authHeaders(bearer),
    },
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch permissions.");
  }

  const data = (await res.json()) as UserPermissions[];
  return data;
}

export async function getCompanyPermissions(): Promise<CompanyPermissions[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }
  token = sanitize(token);

  const url = `${BASE_URL}/users/permissions?isGlobal=10.2`;

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: {
      ...authHeaders(bearer),
    },
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch permissions.");
  }

  const data = (await res.json()) as CompanyPermissions[];
  return data;
}

export async function updateEmployeePermissions(
  userId: string,
  permissions: { permissionId: number; roleId: number }[]
): Promise<void> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }
  token = sanitize(token);

  const url = `${BASE_URL}/users/edit-permissions/${userId}`;

  const init = (bearer: string): RequestInit => ({
    method: "PUT",
    headers: {
      ...authHeaders(bearer),
    },
    body: JSON.stringify({ userId: Number(userId), permissions }),
    cache: "no-store",
  });

  let res = await fetch(url, init(token));

  if (shouldRefresh(res.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch permissions.");
  }
}
