import {
    TKycResponse,
    TRegisterFields,
    TRegisterResponse,
    TCompanyRegistrationInfo,
    TEditCompanyInfoPayload,
    TAttachment, // <-- newly added in types.ts
  } from "./types";
  
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  
  export async function getKycByCode(code: string): Promise<TKycResponse> {
    const response = await fetch(`${BASE_API}/companies/kyc/${code}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch KYC data");
    }
    return response.json();
  }
  
  export async function registerCompany(
    data: TRegisterFields
  ): Promise<TRegisterResponse> {
    const response = await fetch(`${BASE_API}/companies/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyCode: data.companyCode,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        roleId: data.roleId,
      }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to register company");
    }
  
    return response.json();
  }
  
  export async function uploadDocuments(
    code: string,
    email: string,
    passportFiles: File[],
    birthFiles: File[]
  ): Promise<void> {
    const allFiles = [...passportFiles, ...birthFiles];
    const subjects: string[] = [];
    const descriptions: string[] = [];
  
    passportFiles.forEach(() => {
      subjects.push("Passport");
      descriptions.push("Passport document");
    });
  
    birthFiles.forEach(() => {
      subjects.push("Birth");
      descriptions.push("Certified birth statement");
    });
  
    if (allFiles.length === 0) {
      throw new Error("No files selected for upload.");
    }
  
    const formData = new FormData();
  
    allFiles.forEach((file, i) => {
      formData.append("files", file);
      formData.append("Subject", subjects[i]);
      formData.append("Description", descriptions[i]);
    });
  
    formData.append("CreatedBy", email);
  
    const url = `${BASE_API}/companies/${code}/attachments/UploadBatch`;
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
  
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(
        `Failed to upload documents. Status=${res.status}, Message=${msg}`
      );
    }
  }
  
  /**
   * Get company registration info by company code
   */
  export async function getCompanyRegistrationInfoByCode(
    code: string
  ): Promise<TCompanyRegistrationInfo> {
    const response = await fetch(`${BASE_API}/companies/getInfo/${code}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch Company Registration Info");
    }
    return response.json();
  }
  
  /**
   * Edit (update) company info for a given userId (PUT)
   * POST URL => /companies/public/users/{userId}
   */
  export async function editCompanyInfo(
    userId: string,
    data: TEditCompanyInfoPayload
  ): Promise<void> {
    const response = await fetch(`${BASE_API}/companies/public/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      const msg = await response.text();
      throw new Error(
        `Failed to edit company info. Status=${response.status}, Message=${msg}`
      );
    }
  }
  

  export async function getCompanyAttachments(code: string): Promise<TAttachment[]> {
    const url = `${BASE_API}/companies/${code}/attachments`;
    const response = await fetch(url, {
      method: "GET",
    });
    if (!response.ok) {
      const msg = await response.text();
      throw new Error(
        `Failed to fetch attachments. Status=${response.status}, Message=${msg}`
      );
    }
  
    // The endpoint returns an array of attachment objects
    return response.json();
  }


  /**
 * Deletes a specific attachment by ID for a given company code.
 */
export async function deleteAttachment(code: string, attachmentId: string): Promise<void> {
    const url = `${BASE_API}/companies/${code}/attachments/${attachmentId}`;
    const response = await fetch(url, {
      method: "DELETE",
    });
  
    if (!response.ok) {
      const msg = await response.text();
      throw new Error(`Failed to delete attachment. Status=${response.status}, Message=${msg}`);
    }
  }
  