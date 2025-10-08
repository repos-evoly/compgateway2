import { GetPricingResponse } from "@/types";

const API_BASE = "/Companygw/api/admin/pricing" as const;

export async function getPricing(): Promise<GetPricingResponse> {
  const res = await fetch(API_BASE, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch pricing info. Status: ${res.status}`);
  }

  return (await res.json()) as GetPricingResponse;
}
