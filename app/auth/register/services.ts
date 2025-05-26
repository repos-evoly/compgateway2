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