"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import Cookies from "js-cookie";
import type { CompanyEmployee, CreateEmployeePayload } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;

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

  const token = getAccessTokenFromCookies();
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
    throw new Error(`Failed to fetch employees. Status: ${res.status}`);
  }

  const data = await res.json();
  return data as CompanyEmployee[];
}

/**
 * GET /companies/{companyCode}/users/{userId}
 */
export async function getEmployeeById(userId: string | number): Promise<CompanyEmployee> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const token = getAccessTokenFromCookies();
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
    throw new Error(`Failed to fetch employee #${userId}. Status: ${res.status}`);
  }

  const data = await res.json();
  return data as CompanyEmployee;
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

  const token = getAccessTokenFromCookies();
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
    throw new Error(`Failed to create employee. Status: ${res.status}`);
  }

  const data = await res.json();
  return data as CompanyEmployee;
}
