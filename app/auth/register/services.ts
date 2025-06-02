import { TKycResponse, TRegisterFields, TRegisterResponse } from "./types";

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


export async function registerCompany(data: TRegisterFields): Promise<TRegisterResponse> {
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
  
    // Return JSON response (or adjust as needed)
    return response.json();
  }


  export async function uploadDocuments(
    code: string,
    email: string,
    passportFiles: File[],
    birthFiles: File[]
  ): Promise<void> {

    // Combine all files into one array => each must have a matching Subject & Description
    const allFiles = [...passportFiles, ...birthFiles];
    const subjects: string[] = [];
    const descriptions: string[] = [];
  
    // For each passport file => Subject="Passport", Description="Passport document"
    passportFiles.forEach(() => {
      subjects.push("Passport");
      descriptions.push("Passport document");
    });
  
    // For each birth file => Subject="Birth", Description="Birth certificate"
    birthFiles.forEach(() => {
      subjects.push("Birth");
      descriptions.push("Certified birth statement");
    });
  
    if (allFiles.length === 0) {
      throw new Error("No files selected for upload.");
    }
  
    // Build FormData
    const formData = new FormData();
  
    // Append each file with its corresponding Subject & Description
    allFiles.forEach((file, i) => {
      formData.append("files", file); // Must match the C# request.Form.Files
      formData.append("Subject", subjects[i]);
      formData.append("Description", descriptions[i]);
    });
  
    // createdBy is just a single string in the form
    formData.append("CreatedBy", email);
  
    // Make the fetch request => POST /companies/{code}/attachments
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