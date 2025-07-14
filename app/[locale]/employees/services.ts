"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import Cookies from "js-cookie";
import type {
  CompanyEmployee,
  CompanyPermissions,
  CreateEmployeePayload,
  RoleOption,
  UserPermissions,
  EditEmployeePayload,
} from "./types";
import { throwApiError } from "@/app/helpers/handleApiError"; // adjust path if needed


const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;
const token = getAccessTokenFromCookies();

/**
 * Gets the company code from cookies, decoding any '%22' quotes at the start/end.
 * If the cookie is something like '%22725010%22', decode => '"725010"' => strip => '725010'.
 */
function getCompanyCodeFromCookies(): string {
  const raw = Cookies.get("companyCode");
  if (!raw) {
    throw new Error("No companyCode cookie found");
  }

  // Decode any URI-encoded special chars
  const decoded = decodeURIComponent(raw);
  // Remove leading and trailing quotes if present
  const stripped = decoded.replace(/^"|"$/g, "");

  if (!stripped) {
    throw new Error("Empty or invalid companyCode after stripping quotes");
  }
  return stripped;
}

/**
 * GET /companies/{companyCode}/users
 */
export async function getEmployees(): Promise<CompanyEmployee[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const companyCode = getCompanyCodeFromCookies();
  const url = `${BASE_URL}/companies/${companyCode}/users`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch employees.");
  }
  
  const data = await res.json();
  console.log("Fetched Employees Data:", data);
  return data as CompanyEmployee[];
}

/**
 * GET /companies/{companyCode}/users/{userId}
 */
export async function getEmployeeById(userId: string | number): Promise<CompanyEmployee> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const companyCode = getCompanyCodeFromCookies();
  const url = `${BASE_URL}/companies/${companyCode}/users/${userId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch employees.");
  }

  const data = await res.json();
  return data as CompanyEmployee;
}

/**
 * POST /companies/{companyCode}/users
 */
export async function createEmployee(payload: CreateEmployeePayload): Promise<CompanyEmployee> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const companyCode = getCompanyCodeFromCookies();
  const url = `${BASE_URL}/companies/${companyCode}/users`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to create employees.");
  }

  const data = await res.json();
  return data as CompanyEmployee;
}

/**
 * PUT /companies/{companyCode}/users/{userId}
 */
export async function editEmployee(
  userId: number,
  payload: EditEmployeePayload
): Promise<CompanyEmployee> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const companyCode = getCompanyCodeFromCookies();
  const url = `${BASE_URL}/companies/${companyCode}/users/${userId}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to edit employees.");
  }

  // Check if response has content before trying to parse JSON
  const responseText = await res.text();
  console.log('Raw response text:', responseText);
  
  let data: CompanyEmployee;
  if (responseText && responseText.trim()) {
    try {
      data = JSON.parse(responseText);
      console.log('Edit employee API response:', data);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      console.log('Response was not valid JSON, but request was successful');
      // If we can't parse the response but the request was successful (200 OK),
      // we can assume the update was successful and return a minimal success response
      data = {
        id: userId,
        authUserId: 0, // We don't have this info
        companyCode: companyCode,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        roleId: payload.roleId,
        permissions: [],
        isActive: payload.isActive
      };
    }
  } else {
    console.log('Response was empty, but request was successful');
    // If the response is empty but the request was successful (200 OK),
    // we can assume the update was successful and return a minimal success response
    data = {
      id: userId,
      authUserId: 0, // We don't have this info
      companyCode: companyCode,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      roleId: payload.roleId,
      permissions: [],
      isActive: payload.isActive
    };
  }

  return data as CompanyEmployee;
}

/**
 * Toggle employee active/inactive status
 */
export async function toggleEmployeeStatus(id: number): Promise<CompanyEmployee> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  if (!token) {
    throw new Error("No access token found in cookies");
  }

  try {
    console.log('Starting toggle for employee ID:', id);
    
    // First get the current employee to know the current status
    const currentEmployee = await getEmployeeById(id);
    console.log('Current employee:', currentEmployee);
    console.log('Current employee status:', currentEmployee.isActive);
    
    // Calculate the new status (opposite of current)
    const newStatus = !currentEmployee.isActive;
    console.log('Calculated new status:', newStatus);
    
    // Check if the API supports isActive field
    const supportsIsActive = currentEmployee.isActive !== undefined;
    console.log('API supports isActive field:', supportsIsActive);
    
    // Update with the opposite status
    const updatedData = {
      firstName: currentEmployee.firstName,
      lastName: currentEmployee.lastName,
      email: currentEmployee.email,
      phone: currentEmployee.phone,
      roleId: currentEmployee.roleId,
      // Only include isActive if the API supports it
      ...(supportsIsActive && { isActive: newStatus })
    };
    
    console.log('Sending update with new status:', updatedData.isActive);
    console.log('Full update data:', updatedData);

    const companyCode = getCompanyCodeFromCookies();
    const url = `${BASE_URL}/companies/${companyCode}/users/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      await throwApiError(response, "Failed to toggle employee status");
    }

    // Check if response has content before trying to parse JSON
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    let result: unknown;
    if (responseText && responseText.trim()) {
      try {
        result = JSON.parse(responseText);
        console.log('Toggle API response:', result);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.log('Response was not valid JSON, treating as empty response');
        result = {};
      }
    } else {
      console.log('Response was empty, treating as successful update');
      result = {};
    }
    // Type guard for CompanyEmployee
    let finalResult: CompanyEmployee;
    if (typeof result === 'object' && result !== null && 'isActive' in result) {
      finalResult = result as CompanyEmployee;
      console.log('Using API response isActive:', (result as CompanyEmployee).isActive);
    } else if (supportsIsActive) {
      finalResult = {
        id: (result as Partial<CompanyEmployee>).id || currentEmployee.id,
        authUserId: (result as Partial<CompanyEmployee>).authUserId || currentEmployee.authUserId,
        companyCode: (result as Partial<CompanyEmployee>).companyCode || currentEmployee.companyCode,
        firstName: (result as Partial<CompanyEmployee>).firstName || currentEmployee.firstName,
        lastName: (result as Partial<CompanyEmployee>).lastName || currentEmployee.lastName,
        username: (result as Partial<CompanyEmployee>).username || currentEmployee.username,
        email: (result as Partial<CompanyEmployee>).email || currentEmployee.email,
        phone: (result as Partial<CompanyEmployee>).phone || currentEmployee.phone,
        roleId: (result as Partial<CompanyEmployee>).roleId || currentEmployee.roleId,
        permissions: (result as Partial<CompanyEmployee>).permissions || currentEmployee.permissions,
        isActive: newStatus
      };
      console.log('Using calculated isActive:', newStatus);
    } else {
      finalResult = {
        ...currentEmployee,
        isActive: true // Default to active if API doesn't support status
      };
      console.log('API does not support isActive, defaulting to active');
    }
    console.log('Final result:', finalResult);
    console.log('Final isActive:', finalResult.isActive);
    return finalResult;
  } catch (error) {
    console.error('Error toggling employee status:', error);
    throw error;
  }
}


export async function getRoles(): Promise<RoleOption[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/users/roles?isGlobal=false`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    await throwApiError(res, "Failed to fetch roles.");
  }
  const data = await res.json();

  return data as RoleOption[];
}


export async function getPermissionsByUserId(userId: string): Promise<UserPermissions[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/users/${userId}/permissions`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch permissions.");
  }
  const data = await res.json();
  return data as UserPermissions[];
}

export async function getCompanyPermissions(): Promise<CompanyPermissions[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/users/permissions?isGlobal=10.2`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch permissions.");
  }

  const data = await res.json();
  return data as CompanyPermissions[];
}

export async function updateEmployeePermissions(
  userId: string,
  permissions: { permissionId: number; roleId: number }[]
): Promise<void> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/users/edit-permissions/${userId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId: Number(userId), permissions }),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch permissions.");
  }
}

