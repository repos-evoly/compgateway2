"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import { throwApiError } from "@/app/helpers/handleApiError";
import { PostSalaryCycleResponse, SalaryCyclesResponse, TSalaryTransaction } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;

/**
 * GET /api/employees/salarycycles
 * Fetch employees for salary cycle management
 */
export async function getEmployeeSalaryCycles(
  page = 1,
  limit = 50
): Promise<SalaryCyclesResponse> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  const url = `${BASE_URL}/employees/salarycycles?page=${page}&limit=${limit}`;

  // Read token at call time
  let token = getAccessTokenFromCookies();

  const init = (bearer?: string): RequestInit => ({
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    cache: "no-store",
  });

  // First attempt
  let res = await fetch(url, init(token || undefined));

  // If unauthorized and we had a token, refresh and retry once
  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens(); // saves new cookies too
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through to shared error handling
    }
  }

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

  // Read token at call time
  let token = getAccessTokenFromCookies();
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

  const init = (bearer?: string): RequestInit => ({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  // First attempt
  let res = await fetch(url, init(token || undefined));

  // If unauthorized and we had a token, refresh and retry once
  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

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

  // Read token at call time
  let token = getAccessTokenFromCookies();
  if (!token) {
    console.warn(
      "No access token found in cookies. This might cause authentication issues."
    );
  }

  const url = `${BASE_URL}/api/employees/salarycycles/${employeeId}/post`;

  const init = (bearer?: string): RequestInit => ({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  // First attempt
  let res = await fetch(url, init(token || undefined));

  // If unauthorized and we had a token, refresh and retry once
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
    await throwApiError(res, "Failed to submit salary cycle for employee.");
  }

  const data = (await res.json()) as { success: boolean; message: string };
  console.log("Employee Salary Cycle Submission Response:", data);
  return data;
}

/**
 * GET /employees/salarycycles/{id}
 * Fetch a single salary cycle (including its entries) by ID
 */
export async function getSalaryCycleById(
  cycleId: number
): Promise<TSalaryTransaction> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  const url = `${BASE_URL}/employees/salarycycles/${cycleId}`;

  // Read token at call time
  let token = getAccessTokenFromCookies();

  const init = (bearer?: string): RequestInit => ({
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    cache: "no-store",
  });

  // First attempt
  let res = await fetch(url, init(token || undefined));

  // If unauthorized and we had a token, refresh and retry once
  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

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

  // Read token at call time
  let token = getAccessTokenFromCookies();
  if (!token)
    console.warn(
      "No access token found in cookies – request will be sent unauthenticated."
    );

  const url = `${BASE_URL}/employees/salarycycles/${cycleId}`;
  const payload = {
    salaryMonth: salaryMonthISO,
    debitAccount,
    currency: "LYD",
    entries,
  };

  const init = (bearer?: string): RequestInit => ({
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  // First attempt
  let res = await fetch(url, init(token || undefined));

  // If unauthorized and we had a token, refresh and retry once
  if (res.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      res = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!res.ok) await throwApiError(res, "Failed to edit salary cycle.");
  return (await res.json()) as SubmitCycleResponse;
}

export async function postSalaryCycleById(
  cycleId: number
): Promise<PostSalaryCycleResponse> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  // Read token at call time
  let token = getAccessTokenFromCookies();
  if (!token) {
    console.warn(
      "No access token found in cookies – request will be sent unauthenticated."
    );
  }

  const url = `${BASE_URL}/employees/salarycycles/${cycleId}/post`;

  const init = (bearer?: string): RequestInit => ({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify({}),
    cache: "no-store",
  });

  // First attempt
  let res = await fetch(url, init(token || undefined));

  // If unauthorized and we had a token, refresh and retry once
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
    await throwApiError(res, "Failed to post salary cycle.");
  }

  return (await res.json()) as PostSalaryCycleResponse;
}
