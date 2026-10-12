"use client";

import { handleApiResponse } from "@/app/helpers/apiResponse";
import type {
  PostSalaryCycleResponse,
  SalaryCyclesResponse,
  SalaryWalletBatch,
  SalaryWalletCapabilities,
  TSalaryTransaction,
} from "./types";
import type {
  SalaryAllocationDraft,
} from "../employees/salaryWalletHelpers";

export type NewCycleEntry = {
  employeeId: number;
  salary: number;
  allocations: SalaryAllocationDraft[];
};
export type SubmitCycleResponse = {
  success?: boolean;
  message?: string;
  cycle?: TSalaryTransaction;
};

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
  limit = 50,
  init: RequestInit = {}
): Promise<SalaryCyclesResponse> {
  const response = await fetch(
    buildUrl("employees/salarycycles", { page, limit }),
    withCredentials(init)
  );

  return handleApiResponse<SalaryCyclesResponse>(
    response,
    "Failed to fetch salary cycles."
  );
}

export async function getSalaryWalletCapabilities(): Promise<SalaryWalletCapabilities> {
  const response = await fetch(
    buildUrl("employees/salary-wallet/capabilities"),
    withCredentials()
  );
  const raw = await handleApiResponse<
    SalaryWalletCapabilities & {
      evo?: { enabled?: boolean; configured?: boolean; reason?: string | null };
      bcd?: { enabled?: boolean; configured?: boolean; reason?: string | null };
    }
  >(response, "Failed to load salary wallet availability.");

  const evoConfigured =
    raw.evoConfigured ?? raw.rails?.evoWallet?.configured ?? raw.evo?.configured;
  const bcdConfigured =
    raw.bcdConfigured ?? raw.rails?.bcdWallet?.configured ?? raw.bcd?.configured;
  const evoFeatureEnabled =
    raw.evoEnabled ?? raw.rails?.evoWallet?.enabled ?? raw.evo?.enabled ?? false;
  const bcdFeatureEnabled =
    raw.bcdEnabled ?? raw.rails?.bcdWallet?.enabled ?? raw.bcd?.enabled ?? false;
  const evoAvailable =
    raw.rails?.evoWallet?.available ??
    (evoFeatureEnabled && evoConfigured === true);
  const bcdAvailable =
    raw.rails?.bcdWallet?.available ??
    (bcdFeatureEnabled && bcdConfigured === true);

  return {
    ...raw,
    evoEnabled: evoAvailable,
    bcdEnabled: bcdAvailable,
    evoConfigured,
    bcdConfigured,
    evoUnavailableReason:
      raw.evoUnavailableReason ?? raw.rails?.evoWallet?.reason ?? raw.evo?.reason ?? null,
    bcdUnavailableReason:
      raw.bcdUnavailableReason ?? raw.rails?.bcdWallet?.reason ?? raw.bcd?.reason ?? null,
  };
}

export async function submitSalaryCycle(
  debitAccount: string,
  salaryMonthArabic: string,
  entries: NewCycleEntry[],
  additionalMonth?: string | null
): Promise<SubmitCycleResponse> {
  const payload: Record<string, unknown> = {
    salaryMonth: salaryMonthArabic,
    debitAccount,
    currency: "LYD",
    entries,
  };
  if (
    additionalMonth !== undefined &&
    additionalMonth !== null &&
    additionalMonth !== "0"
  ) {
    const trimmed = String(additionalMonth).trim();
    if (trimmed.length > 0) {
      payload.additionalMonth = Number(trimmed);
    }
  }

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
    buildUrl(`employees/salarycycles/${cycleId}/update`),
    jsonRequest("POST", payload)
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

export async function refreshSalaryWalletBatchStatus(
  cycleId: number,
  internalBatchId: number
): Promise<TSalaryTransaction | SalaryWalletBatch> {
  const response = await fetch(
    buildUrl(
      `employees/salarycycles/${cycleId}/wallet-batches/${internalBatchId}/refresh`
    ),
    jsonRequest("POST", {})
  );
  return handleApiResponse<TSalaryTransaction | SalaryWalletBatch>(
    response,
    "Failed to refresh the provider status."
  );
}

export async function retrySalaryWalletBatch(
  cycleId: number,
  internalBatchId: number
): Promise<TSalaryTransaction | SalaryWalletBatch> {
  const response = await fetch(
    buildUrl(
      `employees/salarycycles/${cycleId}/wallet-batches/${internalBatchId}/retry`
    ),
    jsonRequest("POST", {})
  );
  return handleApiResponse<TSalaryTransaction | SalaryWalletBatch>(
    response,
    "Failed to retry the wallet batch."
  );
}

/* ------------------------------------------------------------------ */
/* Repost helpers (edit entry, then update cycle)                      */
/* ------------------------------------------------------------------ */

export async function editSalaryCycleEntry(
  cycleId: number,
  entryId: number,
  payload: { amount: number; accountNumber: string }
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    buildUrl(`employees/salarycycles/${cycleId}/entries/${entryId}/edit`),
    jsonRequest("POST", payload)
  );

  return handleApiResponse<{ success: boolean; message: string }>(
    response,
    "Failed to edit salary cycle entry."
  );
}

export async function updateSalaryCycle(
  cycleId: number,
  employeeIds: number[]
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    buildUrl(`employees/salarycycles/${cycleId}/repost`),
    jsonRequest("POST", { employeeIds })
  );

  return handleApiResponse<{ success: boolean; message: string }>(
    response,
    "Failed to update salary cycle."
  );
}
