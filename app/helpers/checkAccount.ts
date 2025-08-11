import { getAccessTokenFromCookies } from "./tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";

export type AccountInfo = {
  accountString: string;
  availableBalance: number;
  debitBalance: number;
};

// The API returns an array of AccountInfo, not an object
export async function CheckAccount(accountNumber: string): Promise<AccountInfo[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;

  if (!baseUrl) {
    throw new Error("Base URL is not defined in environment variables.");
  }

  const url = `${baseUrl}/transfers/accounts?account=${encodeURIComponent(accountNumber)}`;

  // Read token at call time
  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  // First attempt
  let res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  // If unauthorized and we had a token, refresh and retry once
  if (res.status === 401) {
    try {
      const refreshed = await refreshAuthTokens(); // saves new cookies as well
      token = refreshed.accessToken;

      res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
    } catch {
      // Fall through to error handling below
    }
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch account info. Status: ${res.status}`);
  }

  const data = (await res.json()) as AccountInfo[];
  return data;
}
