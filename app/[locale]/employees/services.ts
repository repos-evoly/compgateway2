"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import Cookies from "js-cookie";
import type {
  CompanyEmployee,
  CompanyPermissions,
  CreateEmployeePayload,
  RoleOption,
  UserPermissions,
  EditEmployeePayload,
} from "./types";
import { throwApiError } from "@/app/helpers/handleApiError"; // adjust path if needed


const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;
const token = getAccessTokenFromCookies();

/**
 * Gets the company code from cookies, decoding any '%22' quotes at the start/end.
 * If the cookie is something like '%22725010%22', decode => '"725010"' => strip => '725010'.
 */
function getCompanyCodeFromCookies(): string {
  const raw = Cookies.get("companyCode");
  if (!raw) {
    throw new Error("No companyCode cookie found");
  }

  // Decode any URI-encoded special chars
  const decoded = decodeURIComponent(raw);
  // Remove leading and trailing quotes if present
  const stripped = decoded.replace(/^"|"$/g, "");

  if (!stripped) {
    throw new Error("Empty or invalid companyCode after stripping quotes");
  }
  return stripped;
}

/**
 * GET /companies/{companyCode}/users
 */
export async function getEmployees(): Promise<CompanyEmployee[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const companyCode = getCompanyCodeFromCookies();
  const url = `${BASE_URL}/companies/${companyCode}/users`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch employees.");
  }
  
  const data = await res.json();
  console.log("Fetched Employees Data:", data);
  return data as CompanyEmployee[];
}

/**
 * GET /companies/{companyCode}/users/{userId}
 */
export async function getEmployeeById(userId: string | number): Promise<CompanyEmployee> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const companyCode = getCompanyCodeFromCookies();
  const url = `${BASE_URL}/companies/${companyCode}/users/${userId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch employees.");
  }

  const data = await res.json();
  return data as CompanyEmployee;
}

/**
 * POST /companies/{companyCode}/users
 */
export async function createEmployee(payload: CreateEmployeePayload): Promise<CompanyEmployee> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const companyCode = getCompanyCodeFromCookies();
  const url = `${BASE_URL}/companies/${companyCode}/users`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to create employees.");
  }

  const data = await res.json();
  return data as CompanyEmployee;
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

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const companyCode = getCompanyCodeFromCookies();
  const url = `${BASE_URL}/companies/${companyCode}/users/${userId}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to edit employees.");
  }

  const data = await res.json();
  return data as CompanyEmployee;
}



export async function getRoles(): Promise<RoleOption[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/users/roles?isGlobal=false`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    await throwApiError(res, "Failed to fetch roles.");
  }
  const data = await res.json();

  return data as RoleOption[];
}


export async function getPermissionsByUserId(userId: string): Promise<UserPermissions[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/users/${userId}/permissions`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch permissions.");
  }
  const data = await res.json();
  return data as UserPermissions[];
}

export async function getCompanyPermissions(): Promise<CompanyPermissions[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/users/permissions?isGlobal=false`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch permissions.");
  }

  const data = await res.json();
  return data as CompanyPermissions[];
}

export async function updateEmployeePermissions(
  userId: string,
  permissions: { permissionId: number; roleId: number }[]
): Promise<void> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/users/edit-permissions/${userId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId: Number(userId), permissions }),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch permissions.");
  }
}

