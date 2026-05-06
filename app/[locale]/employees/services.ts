"use client";

import { handleApiResponse, ensureApiSuccess } from "@/app/helpers/apiResponse";
import type {
  EmployeeFormValues,
  EmployeeExcelImportResult,
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

const activeEmployeesOnly = (employees: EmployeeResponse[]): EmployeeResponse[] =>
  employees.filter((employee) => employee.isDeleted !== true);

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
    const activeEmployees = activeEmployeesOnly(data);
    return {
      data: activeEmployees,
      page: 1,
      limit: activeEmployees.length,
      totalPages: 1,
      totalRecords: activeEmployees.length,
    } as EmployeesApiResponse;
  }

  const paged = data as EmployeesApiResponse;
  return {
    ...paged,
    data: activeEmployeesOnly(paged.data),
  };
};

export const getAllEmployees = async (
  searchTerm = "",
  pageSize = 100
): Promise<EmployeeResponse[]> => {
  const firstPage = await getEmployees(1, pageSize, searchTerm);
  const employeesById = new Map<number, EmployeeResponse>();

  firstPage.data.forEach((employee) => {
    employeesById.set(employee.id, employee);
  });

  const totalPages = Math.max(1, firstPage.totalPages || 1);

  for (let page = 2; page <= totalPages; page++) {
    const nextPage = await getEmployees(page, pageSize, searchTerm);
    nextPage.data.forEach((employee) => {
      employeesById.set(employee.id, employee);
    });
  }

  return Array.from(employeesById.values());
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

export const uploadEmployeesExcel = async (
  file: File
): Promise<EmployeeExcelImportResult> => {
  const formData = new FormData();
  formData.append("files", file);

  const response = await fetch(
    `${API_BASE}/upload`,
    withCredentials({
      method: "POST",
      body: formData,
    })
  );

  return handleApiResponse<EmployeeExcelImportResult>(
    response,
    "Failed to upload employees Excel file"
  );
};
