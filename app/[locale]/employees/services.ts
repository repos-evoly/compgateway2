"use client";

import { handleApiResponse, ensureApiSuccess } from "@/app/helpers/apiResponse";
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

  const data = await handleApiResponse<
    EmployeesApiResponse | EmployeeResponse[]
  >(response, "Failed to fetch employees");

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

  return handleApiResponse<EmployeeResponse>(
    response,
    "Failed to fetch employee by ID"
  );
};

export const createEmployee = async (
  employeeData: EmployeePayload
): Promise<EmployeeResponse> => {
  const response = await fetch(
    API_BASE,
    jsonRequest("POST", employeeData)
  );

  return handleApiResponse<EmployeeResponse>(
    response,
    "Failed to create employee"
  );
};

export const updateEmployee = async (
  id: number,
  employeeData: EmployeePayload
): Promise<EmployeeResponse> => {
  const response = await fetch(
    `${API_BASE}/${id}/update`,
    jsonRequest("POST", employeeData)
  );

  return handleApiResponse<EmployeeResponse>(
    response,
    "Failed to update employee"
  );
};

export const deleteEmployee = async (id: number): Promise<void> => {
  const response = await fetch(
    `${API_BASE}/${id}/delete`,
    withCredentials({ method: "POST" })
  );

  await ensureApiSuccess(response, "Failed to delete employee");
};

export const updateBatchEmployees = async (
  employees: EmployeeFormValues[]
): Promise<void> => {
  const response = await fetch(
    `${API_BASE}/batch/update`,
    jsonRequest("POST", employees)
  );

  await ensureApiSuccess(response, "Failed to update batch employees");
};
