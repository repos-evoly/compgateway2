import { Dashboard } from "./types";

const API_ROOT = "/Companygw/api" as const;

export async function getDashboardData(code: string): Promise<Dashboard> {
  const response = await fetch(`${API_ROOT}/companies/${code}/dashboard`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data. Status: ${response.status}`);
  }

  return (await response.json()) as Dashboard;
}
