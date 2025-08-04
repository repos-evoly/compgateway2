"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { throwApiError } from "@/app/helpers/handleApiError";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;
const token = getAccessTokenFromCookies();

/**
 * Employee salary cycle data structure
 */
export type EmployeeSalaryCycle = {
  id: number;
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  salary: number;
  accountNumber?: string;
  accountType?: "account" | "wallet";
  isSelected?: boolean;
  salaryCycleId?: number;
  cycleDate?: string;
  status?: "pending" | "completed" | "failed";
};

/**
 * Salary cycle submission payload
 */
export type SalaryCyclePayload = {
  employeeIds: number[];
  salaryAmounts: { [employeeId: number]: number };
  cycleDate: string;
  accountNumbers?: { [employeeId: number]: string };
  accountTypes?: { [employeeId: number]: "account" | "wallet" };
};

/**
 * GET /api/employees/salarycycles
 * Fetch employees for salary cycle management
 */
export async function getEmployeeSalaryCycles(): Promise<
  EmployeeSalaryCycle[]
> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    console.warn(
      "No access token found in cookies. This might cause authentication issues."
    );
    // For development, you might want to handle this differently
    // throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/api/employees/salarycycles`;

  console.log("Fetching from URL:", url);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log("Request headers:", headers);

  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  console.log("Response status:", res.status);
  console.log("Response ok:", res.ok);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API Error Response:", errorText);
    throw new Error(
      `API request failed with status ${res.status}: ${errorText}`
    );
  }

  const data = await res.json();
  console.log("Fetched Employee Salary Cycles Data:", data);
  return data as EmployeeSalaryCycle[];
}

/**
 * POST /api/employees/salarycycles
 * Submit salary cycle for selected employees
 */
export async function submitSalaryCycle(
  payload: SalaryCyclePayload
): Promise<{ success: boolean; message: string }> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    console.warn(
      "No access token found in cookies. This might cause authentication issues."
    );
    // For development, you might want to handle this differently
    // throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/api/employees/salarycycles`;

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
    await throwApiError(res, "Failed to submit salary cycle.");
  }

  const data = await res.json();
  console.log("Salary Cycle Submission Response:", data);
  return data as { success: boolean; message: string };
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
 * GET /api/employees/salarycycles/{cycleId}
 * Get specific salary cycle details
 */
