import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { throwApiError } from "@/app/helpers/handleApiError";
import type {
  EmployeeResponse,
  EmployeePayload,
  EmployeesApiResponse,
  EmployeeFormValues,
} from "./types";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
const token =  getAccessTokenFromCookies();

/**
 * Get all employees with pagination and search
 */
export const getEmployees = async (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = ""
): Promise<EmployeesApiResponse> => {
  try {
    if (!token) {
      throw new Error("No access token found");
    }

    // Use the full URL structure as specified by the user
    const url = new URL(`${baseUrl}/employees`);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("limit", limit.toString());
    if (searchTerm) {
      url.searchParams.set("search", searchTerm);
    }

    console.log("Fetching employees from:", url.toString());
    console.log("Full URL:", url.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw await throwApiError(response, "Failed to fetch employees");
    }

    const data = await response.json();
    console.log("Employees API response:", data);

    // Handle both array and paginated response formats
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
    return data;
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
    if (!token) {
      throw new Error("No access token found");
    }

    // Try POST method first (in case the API expects POST with ID in body)
    const url = `${baseUrl}/employees/${id}`;
    console.log("Fetching employee by ID:", url);
    console.log("Token available:", !!token);

    let response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    console.log("POST Response status:", response.status);
    console.log("POST Response ok:", response.ok);

    // If POST fails, try GET method
    if (!response.ok) {
      console.log("POST failed, trying GET method...");
      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("GET Response status:", response.status);
      console.log("GET Response ok:", response.ok);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response text:", errorText);
      throw await throwApiError(response, "Failed to fetch employee by ID");
    }

    const data = await response.json();
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
    if (!token) {
      throw new Error("No access token found");
    }

    const url = `${baseUrl}/employees`;
    console.log("Creating employee:", url, employeeData);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      throw await throwApiError(response, "Failed to create employee");
    }

    const data = await response.json();
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
    if (!token) {
      throw new Error("No access token found");
    }

    const url = `${baseUrl}/employees/${id}`;
    console.log("Updating employee:", url, employeeData);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      throw await throwApiError(response, "Failed to update employee");
    }

    const data = await response.json();
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
    if (!token) {
      throw new Error("No access token found");
    }
    const url = `${baseUrl}/employees/${id}`;
    console.log("Deleting employee:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

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
  employees: EmployeeFormValues[],
): Promise<void> => {
  /* ---------- sanity checks ---------- */
  if (!baseUrl) {
    throw new Error("Base URL is not defined");
  }
  if (!token) {
    throw new Error("No access token found");
  }

  /* ---------- request ---------- */
  const url = `${baseUrl}/employees/batch`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employees),
  });

  /* ---------- error handling ---------- */
  if (!response.ok) {
    throw await throwApiError(response, "Failed to update batch employees");
  }

  /* ---------- success: nothing to return ---------- */
  return; // Promise resolves to void
};