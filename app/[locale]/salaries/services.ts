"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { throwApiError } from "@/app/helpers/handleApiError";
import { PostSalaryCycleResponse, SalaryCyclesResponse, TSalaryTransaction } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;
const token = getAccessTokenFromCookies();



/**
 * GET /api/employees/salarycycles
 * Fetch employees for salary cycle management
 */
export async function getEmployeeSalaryCycles(
  page = 1,
  limit = 50
): Promise<SalaryCyclesResponse> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  const token = getAccessTokenFromCookies();
  const url   = `${BASE_URL}/employees/salarycycles?page=${page}&limit=${limit}`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) await throwApiError(res, "Failed to fetch salary cycles.");

  return (await res.json()) as SalaryCyclesResponse;
}


/* ---------- payload types ---------- */
export type NewCycleEntry = { employeeId: number; salary: number };
export type SubmitCycleResponse = { success: boolean; message: string };

/**
 * POST /employees/salarycycles
 */
export async function submitSalaryCycle(
  debitAccount: string,
  salaryMonthISO: string,
  entries: NewCycleEntry[]
): Promise<SubmitCycleResponse> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  if (!token)
    console.warn(
      "No access token found in cookies – request will be sent unauthenticated."
    );

  const url = `${BASE_URL}/employees/salarycycles`;
  const payload = {
    salaryMonth: salaryMonthISO,
    debitAccount,
    currency: "LYD",
    entries,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) await throwApiError(res, "Failed to submit salary cycle.");
  return (await res.json()) as SubmitCycleResponse;
}


/**
 * POST /api/employees/salarycycles/{id}/post
 * Submit salary cycle for a specific employee
 */
export async function submitSalaryCycleForEmployee(
  employeeId: number,
  payload: {
    salary: number;
    accountNumber?: string;
    accountType?: "account" | "wallet";
    cycleDate: string;
  }
): Promise<{ success: boolean; message: string }> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    console.warn(
      "No access token found in cookies. This might cause authentication issues."
    );
  }

  const url = `${BASE_URL}/api/employees/salarycycles/${employeeId}/post`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to submit salary cycle for employee.");
  }

  const data = await res.json();
  console.log("Employee Salary Cycle Submission Response:", data);
  return data as { success: boolean; message: string };
}

/**
 * GET /employees/salarycycles/{id}
 * Fetch a single salary cycle (including its entries) by ID
 */
export async function getSalaryCycleById(
  cycleId: number
): Promise<TSalaryTransaction> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  const token   = getAccessTokenFromCookies();
  const url     = `${BASE_URL}/employees/salarycycles/${cycleId}`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) await throwApiError(res, "Failed to fetch salary cycle by ID.");

  return (await res.json()) as TSalaryTransaction;
}


/**
 * PUT /employees/salarycycles/{id}
 * Edit an existing salary cycle
 */
export async function editSalaryCycle(
  cycleId: number,
  debitAccount: string,
  salaryMonthISO: string,
  entries: NewCycleEntry[]
): Promise<SubmitCycleResponse> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  if (!token)
    console.warn(
      "No access token found in cookies – request will be sent unauthenticated."
    );

  const url = `${BASE_URL}/employees/salarycycles/${cycleId}`;
  const payload = {
    salaryMonth: salaryMonthISO,
    debitAccount,
    currency: "LYD", // always LYD
    entries,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) await throwApiError(res, "Failed to edit salary cycle.");
  return (await res.json()) as SubmitCycleResponse;
}


export async function postSalaryCycleById(
  cycleId: number
): Promise<PostSalaryCycleResponse> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  if (!token) {
    console.warn(
      "No access token found in cookies – request will be sent unauthenticated."
    );
  }

  const url = `${BASE_URL}/employees/salarycycles/${cycleId}/post`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to post salary cycle.");
  }

  return (await res.json()) as PostSalaryCycleResponse;
}