import { GetPricingResponse } from "@/types";
import { getAccessTokenFromCookies } from "./tokenHandler";

const token = getAccessTokenFromCookies();
const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;


export async function getPricing():Promise<GetPricingResponse> {

    if(!token) throw new Error("No access token found");

    if(!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_API is not defined");
    const url = `${BASE_URL}/admin/pricing`;

    const res = await fetch(url, {    
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

    if (!res.ok) throw new Error(`Failed to fetch pricing info. Status: ${res.status}`);
    return (await res.json()) as GetPricingResponse;

}


