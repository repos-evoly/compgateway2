"use client";

import { throwApiError } from "@/app/helpers/handleApiError";
import type {
  EmployeeFormValues,
  EmployeePayload,
  EmployeeResponse,
  EmployeesApiResponse,
} from "./types";

const API_BASE = "/Companygw/api/employees" as const;

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

export const getEmployees = async (
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<EmployeesApiResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (searchTerm) {
    params.set("search", searchTerm);
  }
  const url = `${API_BASE}?${params.toString()}`;

  const response = await fetch(url, withCredentials());

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch employees");
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return {
      data,
      page: 1,
      limit: data.length,
      totalPages: 1,
      totalRecords: data.length,
    } as EmployeesApiResponse;
  }

  return data as EmployeesApiResponse;
};

export const getEmployeeById = async (
  id: number
): Promise<EmployeeResponse> => {
  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials()
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch employee by ID");
  }

  return (await response.json()) as EmployeeResponse;
};

export const createEmployee = async (
  employeeData: EmployeePayload
): Promise<EmployeeResponse> => {
  const response = await fetch(
    API_BASE,
    jsonRequest("POST", employeeData)
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to create employee");
  }

  return (await response.json()) as EmployeeResponse;
};

export const updateEmployee = async (
  id: number,
  employeeData: EmployeePayload
): Promise<EmployeeResponse> => {
  const response = await fetch(
    `${API_BASE}/${id}`,
    jsonRequest("PUT", employeeData)
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to update employee");
  }

  return (await response.json()) as EmployeeResponse;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({ method: "DELETE" })
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to delete employee");
  }
};

export const updateBatchEmployees = async (
  employees: EmployeeFormValues[]
): Promise<void> => {
  const response = await fetch(
    `${API_BASE}/batch`,
    jsonRequest("PUT", employees)
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to update batch employees");
  }
};
