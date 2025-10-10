"use client";

import { handleApiResponse } from "@/app/helpers/apiResponse";
import type {
  PostSalaryCycleResponse,
  SalaryCyclesResponse,
  TSalaryTransaction,
} from "./types";

export type NewCycleEntry = { employeeId: number; salary: number };
export type SubmitCycleResponse = { success: boolean; message: string };

const API_ROOT = "/Companygw/api" as const;

const buildUrl = (path: string, params?: Record<string, string | number | undefined>): string => {
  const normalized = path.replace(/^\/+/, "");
  const base = `${API_ROOT}/${normalized}`;
  if (!params) {
    return base;
  }
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
};

const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});

const jsonRequest = (method: string, body?: unknown): RequestInit =>
  withCredentials({
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

export async function getEmployeeSalaryCycles(
  page = 1,
  limit = 50
): Promise<SalaryCyclesResponse> {
  const response = await fetch(
    buildUrl("employees/salarycycles", { page, limit }),
    withCredentials()
  );

  return handleApiResponse<SalaryCyclesResponse>(
    response,
    "Failed to fetch salary cycles."
  );
}

export async function submitSalaryCycle(
  debitAccount: string,
  salaryMonthISO: string,
  entries: NewCycleEntry[]
): Promise<SubmitCycleResponse> {
  const payload = {
    salaryMonth: salaryMonthISO,
    debitAccount,
    currency: "LYD",
    entries,
  };

  const response = await fetch(
    buildUrl("employees/salarycycles"),
    jsonRequest("POST", payload)
  );

  return handleApiResponse<SubmitCycleResponse>(
    response,
    "Failed to submit salary cycle."
  );
}

export async function submitSalaryCycleForEmployee(
  employeeId: number,
  payload: {
    salary: number;
    accountNumber?: string;
    accountType?: "account" | "wallet";
    cycleDate: string;
  }
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    buildUrl(`api/employees/salarycycles/${employeeId}/post`),
    jsonRequest("POST", payload)
  );

  return handleApiResponse<{ success: boolean; message: string }>(
    response,
    "Failed to submit salary cycle for employee."
  );
}

export async function getSalaryCycleById(
  cycleId: number
): Promise<TSalaryTransaction> {
  const response = await fetch(
    buildUrl(`employees/salarycycles/${cycleId}`),
    withCredentials()
  );

  return handleApiResponse<TSalaryTransaction>(
    response,
    "Failed to fetch salary cycle by ID."
  );
}

export async function editSalaryCycle(
  cycleId: number,
  debitAccount: string,
  salaryMonthISO: string,
  entries: NewCycleEntry[]
): Promise<SubmitCycleResponse> {
  const payload = {
    salaryMonth: salaryMonthISO,
    debitAccount,
    currency: "LYD",
    entries,
  };

  const response = await fetch(
    buildUrl(`employees/salarycycles/${cycleId}`),
    jsonRequest("PUT", payload)
  );

  return handleApiResponse<SubmitCycleResponse>(
    response,
    "Failed to edit salary cycle."
  );
}

export async function postSalaryCycleById(
  cycleId: number
): Promise<PostSalaryCycleResponse> {
  const response = await fetch(
    buildUrl(`employees/salarycycles/${cycleId}/post`),
    jsonRequest("POST", {})
  );

  return handleApiResponse<PostSalaryCycleResponse>(
    response,
    "Failed to post salary cycle."
  );
}
