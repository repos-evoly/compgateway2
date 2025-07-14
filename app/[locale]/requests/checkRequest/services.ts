"use client";

import { TCheckRequestFormValues, TCheckRequestsResponse, TCheckRequestValues } from "./types";
import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { throwApiError } from "@/app/helpers/handleApiError";
import { TKycResponse } from "@/app/auth/register/types";

/**
 * Fetch all check requests (GET), with optional pagination & search.
 */
export async function getCheckRequests(
  page: number,
  limit: number,
  searchTerm: string = "",
  searchBy: string = ""
): Promise<TCheckRequestsResponse> {
  const baseUrl = "http://10.3.3.11/compgateapi/api"; 
  if (!baseUrl) {
    throw new Error("Base API URL is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = new URL(`${baseUrl}/checkrequests`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (searchTerm) url.searchParams.set("searchTerm", searchTerm);
  if (searchBy) url.searchParams.set("searchBy", searchBy);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch check requests.");
  }

  const data = await response.json() as TCheckRequestsResponse;
  
  console.log('API response for check requests:', data.data);
  
  // Fetch representative names for each check request
  if (data.data && data.data.length > 0) {
    try {
      // Use the same base URL as check requests for consistency
      const baseUrl = "http://10.3.3.11/compgateapi/api";
      const token = getAccessTokenFromCookies(); // Re-get token for representatives
      if (!token) {
        console.error('No access token found for representatives.');
        throw new Error('No access token found for representatives.');
      }

      const representativesResponse = await fetch(`${baseUrl}/representatives?page=1&limit=1000`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!representativesResponse.ok) {
        console.error('Failed to fetch representatives:', representativesResponse.status);
        throw new Error('Failed to fetch representatives');
      }

      const representativesData = await representativesResponse.json();
      console.log('Fetched representatives:', representativesData.data);
      console.log('Representatives response structure:', representativesData);
      
      const representativesMap = new Map(
        representativesData.data.map((rep: { id: number; name: string }) => [rep.id, rep.name])
      );
      console.log('Representatives map:', Array.from(representativesMap.entries()));
      
      // Add representative names to each check request
      data.data = data.data.map(checkRequest => {
        const representativeName = checkRequest.representativeId 
          ? (representativesMap.get(checkRequest.representativeId) as string) || `ID: ${checkRequest.representativeId}`
          : undefined;
        
        console.log('Check request:', {
          id: checkRequest.id,
          representativeId: checkRequest.representativeId,
          representativeName: representativeName
        });
        
        return {
          ...checkRequest,
          representativeName
        };
      });
    } catch (error) {
      console.error('Failed to fetch representative names:', error);
      // Continue without representative names if there's an error
    }
  }

  return data;
}

/**
 * Creates a new check request (POST)
 */
export async function createCheckRequest(values: TCheckRequestFormValues): Promise<TCheckRequestValues> {
  const baseUrl = "http://10.3.3.11/compgateapi/api"; 
  if (!baseUrl) {
    throw new Error("Base API URL is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  // Convert form values to API format
  const payload = {
    branch: values.branch,
    date: values.date.toISOString(), // Convert Date to ISO string
    customerName: values.customerName,
    cardNum: values.cardNum,
    accountNum: values.accountNum,
    beneficiary: values.beneficiary,
    representativeId: values.representativeId,
    lineItems: values.lineItems.map(item => ({
      dirham: item.dirham,
      lyd: item.lyd,
    })),
  };

  const response = await fetch(`${baseUrl}/checkrequests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to create check request.");
  }

  const responseData = await response.json() as TCheckRequestValues;
  
  // Fetch representative name if representativeId exists
  if (responseData.representativeId) {
    try {
      const baseUrl = "http://10.3.3.11/compgateapi/api";
      const token = getAccessTokenFromCookies();
      if (!token) {
        console.error('No access token found for representatives.');
        throw new Error('No access token found for representatives.');
      }

      const representativesResponse = await fetch(`${baseUrl}/representatives?page=1&limit=1000`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!representativesResponse.ok) {
        console.error('Failed to fetch representatives:', representativesResponse.status);
        throw new Error('Failed to fetch representatives');
      }

      const representativesData = await representativesResponse.json();
      const representative = representativesData.data.find((rep: { id: number; name: string }) => rep.id === responseData.representativeId);
      if (representative) {
        responseData.representativeName = representative.name;
      }
    } catch (error) {
      console.error('Failed to fetch representative name:', error);
      // Continue without representative name if there's an error
    }
  }
  
  return responseData;
}

/**
 * Fetch a single check request by ID (GET)
 */
export async function getCheckRequestById(id: string | number): Promise<TCheckRequestValues> {
  const baseUrl = "http://10.3.3.11/compgateapi/api";
  if (!baseUrl) {
    throw new Error("Base API URL is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const response = await fetch(`${baseUrl}/checkrequests/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await throwApiError(response, `Failed to fetch check request by ID ${id}.`);
  }

  const data = await response.json() as TCheckRequestValues;
  
  // Fetch representative name if representativeId exists
  if (data.representativeId) {
    try {
      const baseUrl = "http://10.3.3.11/compgateapi/api";
      const token = getAccessTokenFromCookies();
      if (!token) {
        console.error('No access token found for representatives.');
        throw new Error('No access token found for representatives.');
      }

      const representativesResponse = await fetch(`${baseUrl}/representatives?page=1&limit=1000`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!representativesResponse.ok) {
        console.error('Failed to fetch representatives:', representativesResponse.status);
        throw new Error('Failed to fetch representatives');
      }

      const representativesData = await representativesResponse.json();
      const representative = representativesData.data.find((rep: { id: number; name: string }) => rep.id === data.representativeId);
      if (representative) {
        data.representativeName = representative.name;
      }
    } catch (error) {
      console.error('Failed to fetch representative name:', error);
      // Continue without representative name if there's an error
    }
  }
  
  return data;
}

/**
 * Updates a check request (PUT) with all the data fields.
 */
export async function updateCheckRequestById(
  id: string | number,
  values: TCheckRequestFormValues
): Promise<TCheckRequestValues> {
  const baseUrl = "http://10.3.3.11/compgateapi/api";
  if (!baseUrl) {
    throw new Error("Base API URL is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  // Convert form values to API format
  const payload = {
    branch: values.branch,
    date: values.date.toISOString(), // Convert Date to ISO string
    customerName: values.customerName,
    cardNum: values.cardNum,
    accountNum: values.accountNum,
    beneficiary: values.beneficiary,
    representativeId: values.representativeId,
    lineItems: values.lineItems.map(item => ({
      dirham: item.dirham,
      lyd: item.lyd,
    })),
  };

  const response = await fetch(`${baseUrl}/checkrequests/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwApiError(response, `Failed to update check request with ID ${id}.`);
  }

  const responseData = await response.json() as TCheckRequestValues;
  
  // Fetch representative name if representativeId exists
  if (responseData.representativeId) {
    try {
      const baseUrl = "http://10.3.3.11/compgateapi/api";
      const token = getAccessTokenFromCookies();
      if (!token) {
        console.error('No access token found for representatives.');
        throw new Error('No access token found for representatives.');
      }

      const representativesResponse = await fetch(`${baseUrl}/representatives?page=1&limit=1000`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!representativesResponse.ok) {
        console.error('Failed to fetch representatives:', representativesResponse.status);
        throw new Error('Failed to fetch representatives');
      }

      const representativesData = await representativesResponse.json();
      const representative = representativesData.data.find((rep: { id: number; name: string }) => rep.id === responseData.representativeId);
      if (representative) {
        responseData.representativeName = representative.name;
      }
    } catch (error) {
      console.error('Failed to fetch representative name:', error);
      // Continue without representative name if there's an error
    }
  }
  
  return responseData;
}

/**
 * Fetch KYC data by company code (6 digits after first 4 digits of account number)
 */
export async function getKycByCode(code: string): Promise<TKycResponse> {
  const baseUrl = "http://10.3.3.11/compgateapi/api";
  if (!baseUrl) {
    throw new Error("Base API URL is not defined");
  }

  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const response = await fetch(`${baseUrl}/companies/kyc/${code}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch KYC data");
  }

  return response.json();
}