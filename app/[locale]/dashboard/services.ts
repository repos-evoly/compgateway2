import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import { Dashboard } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;

export async function getDashboardData(code: string): Promise<Dashboard> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const url = `${BASE_URL}/companies/${code}/dashboard`;

  // Read the current access token from cookies at call time (not at module load)
  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  // First attempt with the current token
  let res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  // If unauthorized AND we had a token, try to refresh and retry once
  if (res.status === 401) {
    try {
      const refreshed = await refreshAuthTokens(); // helper also saves new cookies
      token = refreshed.accessToken;

      res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
    } catch (e) {
      console.error("Failed to refresh auth tokens:", e);
    }
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard data. Status: ${res.status}`);
  }

  const data = (await res.json()) as Dashboard;
  return data;
}
