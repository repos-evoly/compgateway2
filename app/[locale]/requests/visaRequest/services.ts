// app/(wherever)/visarequests/services.ts
import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { VisaRequestApiResponse, VisaRequestApiItem, VisaRequestFormValues } from "./types";

const token = getAccessTokenFromCookies();

export const getVisaRequests = async (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = ""
): Promise<VisaRequestApiResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API; 
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined in .env");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  // Construct the URL with query params
  const url = new URL(`${baseUrl}/visarequests`);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());
  if (searchTerm) {
    url.searchParams.set("searchTerm", searchTerm);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch visa requests. Status: ${response.status}`);
  }

  const data = (await response.json()) as VisaRequestApiResponse;
  return data;
};

/** New function: get by ID => returns a single VisaRequestApiItem */
export const getVisaRequestById = async (
  id: number
): Promise<VisaRequestApiItem> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined in .env");
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${baseUrl}/visarequests/${id}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch visa request by ID. Status: ${response.status}`);
  }

  const data = (await response.json()) as VisaRequestApiItem;
  return data;
};


export const createVisaRequest = async (
    formValues: VisaRequestFormValues
  ): Promise<VisaRequestApiItem> => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_API is not defined in .env");
    if (!token) throw new Error("No access token found in cookies");
  
    // The API requires all fields (string/number).
    // We'll convert `undefined` => "" or 0.
    const body = {
      branch: formValues.branch ?? "",
      date: formValues.date ?? "",
      accountHolderName: formValues.accountHolderName ?? "",
      accountNumber: formValues.accountNumber ?? "",
      nationalId: formValues.nationalId ?? 0,
      phoneNumberLinkedToNationalId: formValues.phoneNumberLinkedToNationalId ?? "",
      cbl: formValues.cbl ?? "",
      cardMovementApproval: formValues.cardMovementApproval ?? "",
      cardUsingAcknowledgment: formValues.cardUsingAcknowledgment ?? "",
      foreignAmount: formValues.foreignAmount ?? 0,
      localAmount: formValues.localAmount ?? 0,
      pldedge: formValues.pldedge ?? "",
    };
  
    const response = await fetch(`${baseUrl}/visarequests`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  
    if (!response.ok) {
      throw new Error(
        `Failed to create visa request. Status: ${response.status}`
      );
    }
  
    // The API might return the newly created item
    const created = (await response.json()) as VisaRequestApiItem;
    return created;
  };