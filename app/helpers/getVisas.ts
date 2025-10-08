import { VisaItemList } from "@/types";

const API_BASE = "/Companygw/api/visas/company" as const;

export async function getVisas(): Promise<VisaItemList> {
  const res = await fetch(API_BASE, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch visas. Status: ${res.status}`);
  }

  return (await res.json()) as VisaItemList;
}
