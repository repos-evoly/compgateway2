import { handleApiResponse } from "@/app/helpers/apiResponse";
import { Dashboard } from "./types";

const API_ROOT = "/Companygw/api" as const;

export async function getDashboardData(code: string): Promise<Dashboard> {
  const response = await fetch(`${API_ROOT}/companies/${code}/dashboard`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return handleApiResponse<Dashboard>(
    response,
    "Failed to fetch dashboard data."
  );
}
