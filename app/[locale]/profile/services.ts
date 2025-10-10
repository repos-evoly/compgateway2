import { handleApiResponse } from "@/app/helpers/apiResponse";
import { Company } from "./types";

const API_BASE = "/Companygw/api/profile/company" as const;

const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});

export async function getCompannyInfoByCode(code: string): Promise<Company> {
  const response = await fetch(
    `${API_BASE}/${code}`,
    withCredentials({ method: "GET" })
  );

  return handleApiResponse<Company>(
    response,
    `Failed to fetch company info for code: ${code}`
  );
}
