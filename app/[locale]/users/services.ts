// app/services/employees/services.ts
"use client";

import Cookies from "js-cookie";
import type {
  CompanyEmployee,
  CompanyPermissions,
  CreateEmployeePayload,
  EditEmployeePayload,
  RoleOption,
  UserPermissions,
} from "./types";
import { handleApiResponse, ensureApiSuccess } from "@/app/helpers/apiResponse";

const API_ROOT = "/Companygw/api" as const;

const decodeCookie = (value?: string): string =>
  value ? decodeURIComponent(value).replace(/^"|"$/g, "") : "";

function getCompanyCodeFromCookies(): string {
  const raw = Cookies.get("companyCode");
  const code = decodeCookie(raw);
  if (!code) {
    throw new Error("No companyCode cookie found");
  }
  return code;
}

const baseHeaders = (companyCode?: string): HeadersInit => ({
  Accept: "application/json",
  ...(companyCode
    ? { "X-Company-Code": companyCode, "Company-Code": companyCode }
    : {}),
});

const jsonHeaders = (companyCode?: string): HeadersInit => ({
  ...baseHeaders(companyCode),
  "Content-Type": "application/json",
});

const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});

const buildCompanyUsersUrl = (companyCode: string, suffix = ""): string =>
  `${API_ROOT}/companies/${encodeURIComponent(companyCode)}/users${suffix}`;

const parseEmployeeFallback = (
  text: string,
  fallback: CompanyEmployee
): CompanyEmployee => {
  const trimmed = text.trim();
  if (!trimmed) {
    return fallback;
  }
  try {
    return JSON.parse(trimmed) as CompanyEmployee;
  } catch {
    return fallback;
  }
};

export async function getEmployees(): Promise<CompanyEmployee[]> {
  const companyCode = getCompanyCodeFromCookies();
  const response = await fetch(
    buildCompanyUsersUrl(companyCode),
    withCredentials({ headers: baseHeaders(companyCode) })
  );

  return handleApiResponse<CompanyEmployee[]>(
    response,
    "Failed to fetch employees."
  );
}

export async function getEmployeeById(
  userId: string | number
): Promise<CompanyEmployee> {
  const companyCode = getCompanyCodeFromCookies();
  const response = await fetch(
    buildCompanyUsersUrl(companyCode, `/${userId}`),
    withCredentials({ headers: baseHeaders(companyCode) })
  );

  return handleApiResponse<CompanyEmployee>(
    response,
    "Failed to fetch employee."
  );
}

export async function createEmployee(
  payload: CreateEmployeePayload
): Promise<CompanyEmployee> {
  const companyCode = getCompanyCodeFromCookies();
  const response = await fetch(
    buildCompanyUsersUrl(companyCode),
    withCredentials({
      method: "POST",
      headers: jsonHeaders(companyCode),
      body: JSON.stringify(payload),
    })
  );

  return handleApiResponse<CompanyEmployee>(
    response,
    "Failed to create employee."
  );
}

export async function editEmployee(
  userId: number,
  payload: EditEmployeePayload
): Promise<CompanyEmployee> {
  const companyCode = getCompanyCodeFromCookies();
  const response = await fetch(
    buildCompanyUsersUrl(companyCode, `/${userId}`),
    withCredentials({
      method: "PUT",
      headers: jsonHeaders(companyCode),
      body: JSON.stringify(payload),
    })
  );

  const fallback: CompanyEmployee = {
    id: userId,
    authUserId: 0,
    companyCode,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    roleId: payload.roleId,
    permissions: [],
    isActive: payload.isActive,
  };

  const raw = await handleApiResponse<CompanyEmployee | string | undefined>(
    response,
    "Failed to edit employee."
  );

  if (!raw) {
    return fallback;
  }

  if (typeof raw === "string") {
    return parseEmployeeFallback(raw, fallback);
  }

  return raw;
}

export async function toggleEmployeeStatus(
  id: number
): Promise<CompanyEmployee> {
  const current = await getEmployeeById(id);
  const nextPayload: EditEmployeePayload = {
    firstName: current.firstName,
    lastName: current.lastName,
    email: current.email,
    phone: current.phone,
    roleId: current.roleId,
    isActive: !current.isActive,
  };

  return editEmployee(id, nextPayload);
}

export async function getRoles(): Promise<RoleOption[]> {
  const response = await fetch(`${API_ROOT}/users/roles?isGlobal=false`, withCredentials());

  return handleApiResponse<RoleOption[]>(
    response,
    "Failed to fetch roles."
  );
}

export async function getPermissionsByUserId(
  userId: string
): Promise<UserPermissions[]> {
  const response = await fetch(
    `${API_ROOT}/users/${userId}/permissions`,
    withCredentials()
  );

  return handleApiResponse<UserPermissions[]>(
    response,
    "Failed to fetch permissions."
  );
}

export async function getCompanyPermissions(): Promise<CompanyPermissions[]> {
  const response = await fetch(
    `${API_ROOT}/users/permissions/global?isGlobal=false`,
    withCredentials()
  );

  return handleApiResponse<CompanyPermissions[]>(
    response,
    "Failed to fetch permissions."
  );
}

export async function updateEmployeePermissions(
  userId: string,
  permissions: { permissionId: number; roleId: number }[]
): Promise<void> {
  const response = await fetch(
    `${API_ROOT}/users/edit-permissions/${userId}`,
    withCredentials({
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify({ userId: Number(userId), permissions }),
    })
  );

  await ensureApiSuccess(response, "Failed to update permissions.");
}
