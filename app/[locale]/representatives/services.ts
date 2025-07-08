import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { throwApiError } from "@/app/helpers/handleApiError";
import type {
  RepresentativesResponse,
  CreateRepresentativeRequest,
  UpdateRepresentativeRequest,
  Representative,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";
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

export const createRepresentative = async (
  data: CreateRepresentativeRequest
): Promise<Representative> => {
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  try {
    const response = await fetch(`${BASE_URL}/representatives`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await throwApiError(response, "Failed to create representative");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating representative:', error);
    throw error;
  }
};

export const updateRepresentative = async (
  data: UpdateRepresentativeRequest
): Promise<Representative> => {
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  try {
    const response = await fetch(`${BASE_URL}/representatives/${data.id}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await throwApiError(response, "Failed to update representative");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating representative:', error);
    throw error;
  }
};

export const getRepresentativeById = async (id: number): Promise<Representative> => {
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  try {
    const response = await fetch(`${BASE_URL}/representatives/${id}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await throwApiError(response, "Failed to fetch representative by ID");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching representative by ID:', error);
    throw error;
  }
};

export const toggleRepresentativeStatus = async (id: number): Promise<Representative> => {
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  try {
    // First get the current representative to know the current status
    const currentRepresentative = await getRepresentativeById(id);
    
    // Update with the opposite status
    const updatedData = {
      id: currentRepresentative.id,
      name: currentRepresentative.name,
      number: currentRepresentative.number,
      passportNumber: currentRepresentative.passportNumber,
      isActive: !currentRepresentative.isActive
    };

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
    return result;
  } catch (error) {
    console.error('Error toggling representative status:', error);
    throw error;
  }
}; 