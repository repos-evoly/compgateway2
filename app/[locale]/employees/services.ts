"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import { throwApiError } from "@/app/helpers/handleApiError";
import type {
  EmployeeResponse,
  EmployeePayload,
  EmployeesApiResponse,
  EmployeeFormValues,
} from "./types";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API;

/**
 * Get all employees with pagination and search
 */
export const getEmployees = async (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = ""
): Promise<EmployeesApiResponse> => {
  try {
    if (!baseUrl) {
      throw new Error("Base URL is not defined");
    }

    let token = getAccessTokenFromCookies();
    if (!token) {
      throw new Error("No access token found");
    }

    const url = new URL(`${baseUrl}/employees`);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("limit", limit.toString());
    if (searchTerm) {
      url.searchParams.set("search", searchTerm);
    }

    console.log("Fetching employees from:", url.toString());
    console.log("Full URL:", url.toString());

    const init = (bearer?: string): RequestInit => ({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      cache: "no-store",
    });

    let response = await fetch(url.toString(), init(token));

    if (response.status === 401 && token) {
      try {
        const refreshed = await refreshAuthTokens();
        token = refreshed.accessToken;
        response = await fetch(url.toString(), init(token));
      } catch {
        // fall through to error handling
      }
    }

    if (!response.ok) {
      throw await throwApiError(response, "Failed to fetch employees");
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      console.log("API returned array format");
      return {
        data,
        page: 1,
        limit: data.length,
        totalPages: 1,
        totalRecords: data.length,
      };
    }

    console.log("API returned paginated format");
    return data as EmployeesApiResponse;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

/**
 * Get a single employee by ID
 */
export const getEmployeeById = async (
  id: number
): Promise<EmployeeResponse> => {
  try {
    if (!baseUrl) {
      throw new Error("Base URL is not defined");
    }

    let token = getAccessTokenFromCookies();
    if (!token) {
      throw new Error("No access token found");
    }

    const url = `${baseUrl}/employees/${id}`;
    console.log("Fetching employee by ID:", url);
    console.log("Token available:", !!token);

    const init = (bearer?: string): RequestInit => ({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      cache: "no-store",
    });

    let response = await fetch(url, init(token));

    console.log("POST Response status:", response.status);
    console.log("POST Response ok:", response.ok);

    if (response.status === 401 && token) {
      try {
        const refreshed = await refreshAuthTokens();
        token = refreshed.accessToken;
        response = await fetch(url, init(token));
      } catch {
        // fall through
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response text:", errorText);
      throw await throwApiError(response, "Failed to fetch employee by ID");
    }

    const data = (await response.json()) as EmployeeResponse;
    console.log("Employee by ID response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching employee by ID:", error);
    throw error;
  }
};

/**
 * Create a new employee
 */
export const createEmployee = async (
  employeeData: EmployeePayload
): Promise<EmployeeResponse> => {
  try {
    if (!baseUrl) {
      throw new Error("Base URL is not defined");
    }

    let token = getAccessTokenFromCookies();
    if (!token) {
      throw new Error("No access token found");
    }

    const url = `${baseUrl}/employees`;
    console.log("Creating employee:", url, employeeData);

    const init = (bearer?: string): RequestInit => ({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      body: JSON.stringify(employeeData),
      cache: "no-store",
    });

    let response = await fetch(url, init(token));

    if (response.status === 401 && token) {
      try {
        const refreshed = await refreshAuthTokens();
        token = refreshed.accessToken;
        response = await fetch(url, init(token));
      } catch {
        // fall through
      }
    }

    if (!response.ok) {
      throw await throwApiError(response, "Failed to create employee");
    }

    const data = (await response.json()) as EmployeeResponse;
    console.log("Create employee response:", data);
    return data;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

/**
 * Update an existing employee
 */
export const updateEmployee = async (
  id: number,
  employeeData: EmployeePayload
): Promise<EmployeeResponse> => {
  try {
    if (!baseUrl) {
      throw new Error("Base URL is not defined");
    }

    let token = getAccessTokenFromCookies();
    if (!token) {
      throw new Error("No access token found");
    }

    const url = `${baseUrl}/employees/${id}`;
    console.log("Updating employee:", url, employeeData);

    const init = (bearer?: string): RequestInit => ({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      body: JSON.stringify(employeeData),
      cache: "no-store",
    });

    let response = await fetch(url, init(token));

    if (response.status === 401 && token) {
      try {
        const refreshed = await refreshAuthTokens();
        token = refreshed.accessToken;
        response = await fetch(url, init(token));
      } catch {
        // fall through
      }
    }

    if (!response.ok) {
      throw await throwApiError(response, "Failed to update employee");
    }

    const data = (await response.json()) as EmployeeResponse;
    console.log("Update employee response:", data);
    return data;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
};

/**
 * Delete an employee
 */
export const deleteEmployee = async (id: number): Promise<void> => {
  try {
    if (!baseUrl) {
      throw new Error("Base URL is not defined");
    }

    let token = getAccessTokenFromCookies();
    if (!token) {
      throw new Error("No access token found");
    }

    const url = `${baseUrl}/employees/${id}`;
    console.log("Deleting employee:", url);

    const init = (bearer?: string): RequestInit => ({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      cache: "no-store",
    });

    let response = await fetch(url, init(token));

    if (response.status === 401 && token) {
      try {
        const refreshed = await refreshAuthTokens();
        token = refreshed.accessToken;
        response = await fetch(url, init(token));
      } catch {
        // fall through
      }
    }

    if (!response.ok) {
      throw await throwApiError(response, "Failed to delete employee");
    }

    console.log("Employee deleted successfully");
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
};

export const updateBatchEmployees = async (
  employees: EmployeeFormValues[]
): Promise<void> => {
  if (!baseUrl) {
    throw new Error("Base URL is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found");
  }

  const url = `${baseUrl}/employees/batch`;

  const init = (bearer?: string): RequestInit => ({
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(employees),
    cache: "no-store",
  });

  let response = await fetch(url, init(token));

  if (response.status === 401 && token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    throw await throwApiError(response, "Failed to update batch employees");
  }

  return;
};
