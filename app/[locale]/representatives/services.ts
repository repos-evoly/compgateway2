import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { throwApiError } from "@/app/helpers/handleApiError";
import type {
  RepresentativesResponse,
  // CreateRepresentativeRequest,
  // UpdateRepresentativeRequest,
  Representative,
  RepresentativeFormValues,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;
const token = getAccessTokenFromCookies();



export const getRepresentatives = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<RepresentativesResponse> => {
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  try {
    const url = new URL(`${BASE_URL}/representatives`);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("limit", limit.toString());
    
    if (search) {
      url.searchParams.set("search", search);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await throwApiError(response, "Failed to fetch representatives");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching representatives:', error);
    throw error;
  }
};

// services.ts
export const createRepresentative = async (
  values: RepresentativeFormValues
): Promise<Representative> => {
  if (!token) throw new Error("No access token found in cookies");

  const formData = new FormData();
  formData.append("Name", values.name);
  formData.append("Number", values.number);
  formData.append("PassportNumber", values.passportNumber);
  formData.append("IsActive", String(values.isActive));
  if (values.photo[0]) formData.append("Photo", values.photo[0]); // single file

  const res = await fetch(`${BASE_URL}/representatives`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }, // 👈 let the browser add the boundary
    body: formData,
  });

  if (!res.ok) await throwApiError(res, "Failed to create representative");
  return res.json();
};

export const updateRepresentative = async (
  id: number,
  values: RepresentativeFormValues
): Promise<Representative> => {
  if (!token) throw new Error("No access token found in cookies");

  const formData = new FormData();
  formData.append("Name", values.name);
  formData.append("Number", values.number);
  formData.append("PassportNumber", values.passportNumber);
  formData.append("IsActive", String(values.isActive));
  if (values.photo[0]) formData.append("Photo", values.photo[0]);

  const res = await fetch(`${BASE_URL}/representatives/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) await throwApiError(res, "Failed to update representative");
  return res.json();
};


export const getRepresentativeById = async (
  id: number,
): Promise<Representative> => {
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const res = await fetch(`${BASE_URL}/representatives/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to fetch representative by ID");
  }

  return (await res.json()) as Representative;   // ✅ typed result
};

export const deleteRepresentative = async (id: number): Promise<void> => {
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  try {
    const response = await fetch(`${BASE_URL}/representatives/${id}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await throwApiError(response, "Failed to delete representative");
    }
  } catch (error) {
    console.error('Error deleting representative:', error);
    throw error;
  }
};

export const toggleRepresentativeStatus = async (id: number): Promise<Representative> => {
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  try {
    console.log('Starting toggle for representative ID:', id);
    
    // First get the current representative to know the current status
    const currentRepresentative = await getRepresentativeById(id);
    console.log('Current representative:', currentRepresentative);
    console.log('Current representative status:', currentRepresentative.isActive);
    
    // Calculate the new status (opposite of current)
    const newStatus = !currentRepresentative.isActive;
    console.log('Calculated new status:', newStatus);
    
    // Update with the opposite status
    const updatedData = {
      name: currentRepresentative.name,
      number: currentRepresentative.number,
      passportNumber: currentRepresentative.passportNumber,
      isActive: newStatus
    };
    
    console.log('Sending update with new status:', updatedData.isActive);
    console.log('Full update data:', updatedData);

    const response = await fetch(`${BASE_URL}/representatives/${id}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      await throwApiError(response, "Failed to toggle representative status");
    }

    const result = await response.json();
    console.log('Toggle API response:', result);
    
    // Handle different possible response structures
    let finalResult: Representative;
    
    if (result.isActive !== undefined) {
      // API returned the isActive field
      finalResult = result;
      console.log('Using API response isActive:', result.isActive);
    } else {
      // API didn't return isActive, use our calculated value
      finalResult = {
        name: result.name || currentRepresentative.name,
        number: result.number || currentRepresentative.number,
        passportNumber: result.passportNumber || currentRepresentative.passportNumber,
        isActive: newStatus
      };
      console.log('Using calculated isActive:', newStatus);
    }
    
    console.log('Final result:', finalResult);
    console.log('Final isActive:', finalResult.isActive);
    
    return finalResult;
  } catch (error) {
    console.error('Error toggling representative status:', error);
    throw error;
  }
}; 