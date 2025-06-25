// app/(wherever)/visarequests/services.ts
import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { VisaRequestApiResponse, VisaRequestApiItem, VisaRequestFormValues } from "./types";
import { throwApiError } from "@/app/helpers/handleApiError";


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
    await throwApiError(response, "Failed to fetch visa requests");
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
    await throwApiError(response, "Failed to fetch visa request by ID");
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

      const isoDate =
    formValues.date && formValues.date.length === 10   // "2025-06-20"
      ? new Date(`${formValues.date}T00:00:00Z`).toISOString() // → "2025-06-20T00:00:00.000Z"
      : formValues.date ?? "";
  
    // The API requires all fields (string/number).
    // We'll convert `undefined` => "" or 0.
    const body = {
      branch: formValues.branch ?? "",
      date: isoDate,
      accountHolderName: formValues.accountHolderName ?? "",
    
      // 1️⃣  Account number must follow 0000-000000-000
      accountNumber:
        typeof formValues.accountNumber === "string"
          ? formValues.accountNumber
          : String(formValues.accountNumber ?? ""),
    
      // 2️⃣  Phone must be sent as *string*
      phoneNumberLinkedToNationalId: String(
        formValues.phoneNumberLinkedToNationalId ?? ""
      ),
    
      // 3️⃣  Cast numbers
      nationalId: Number(formValues.nationalId) || 0,
      foreignAmount: Number(formValues.foreignAmount) || 0,
      localAmount: Number(formValues.localAmount) || 0,
    
      // 4️⃣  Keep these as strings
      cbl: String(formValues.cbl ?? ""),
      cardMovementApproval: String(formValues.cardMovementApproval ?? ""),
      cardUsingAcknowledgment: formValues.cardUsingAcknowledgment ?? "",
      pldedge: formValues.pldedge ?? "",
    } as const;
    
  
    const response = await fetch(`${baseUrl}/visarequests`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  
    if (!response.ok) {
      await throwApiError(response, "Failed to create visa request");
    }
  
    // The API might return the newly created item
    const created = (await response.json()) as VisaRequestApiItem;
    return created;
  };