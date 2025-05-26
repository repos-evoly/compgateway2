import { getAccessTokenFromCookies } from "./tokenHandler";

export type AccountInfo = {
  accountString: string;
  availableBalance: number;
  debitBalance: number;
};

// The API returns an array of AccountInfo, not an object
export async function CheckAccount(accountNumber: string): Promise<AccountInfo[]> {
  const token = getAccessTokenFromCookies();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;

  if (!token) {
    throw new Error("No access token found in cookies");
  }
  if (!baseUrl) {
    throw new Error("Base URL is not defined in environment variables.");
  }

  // Adjust the URL if needed
  const url = `${baseUrl}/transfers/accounts?account=${accountNumber}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch account info. Status: ${res.status}`);
  }

  // The API returns an array of objects, e.g. [{ accountString, availableBalance, debitBalance }, ...]
  const data = (await res.json()) as AccountInfo[];
  return data;
}
