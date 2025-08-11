// helpers/statementOfAccount/getStatement.ts

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";

type StatementApiResponseItem = {
  postingDate: string;
  narratives: string[];
  amount: number;
  drCr: string;
  isActive: boolean;
  isDeleted: boolean;
  debit: number | string;
  credit: number | string;
};

export type StatementLine = {
  postingDate: string;
  amount: number;
  debit?: string | number;
  credit?: string | number;
  nr1?: string;
  nr2?: string;
  nr3?: string;
  balance?: number;
  reference?: string;
  drCr?: string;
  isActive?: string | number;
  isDeleted?: string | number;
  [key: string]: string | number | undefined;
};

/**
 * Retrieves the statement of account from the external API via GET,
 * passing `account`, `fromDate`, and `toDate` as query parameters.
 * Uses the token from cookies to authorize the request.
 * If the request is unauthorized (401), it refreshes tokens once and retries.
 */
export async function getStatement({
  account,
  fromDate,
  toDate,
}: {
  account: string;
  fromDate: string;
  toDate: string;
}): Promise<StatementLine[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error(
      "Missing environment variable NEXT_PUBLIC_BASE_API. Please set it in your .env file."
    );
  }

  const qs = new URLSearchParams({ account, fromDate, toDate }).toString();
  const url = `${baseUrl}/transfers/statement?${qs}`;

  // Read token at call time
  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies.");
  }

  // First attempt
  let response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  // If unauthorized, refresh and retry once
  if (response.status === 401) {
    try {
      const refreshed = await refreshAuthTokens(); // also updates cookies
      token = refreshed.accessToken;

      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
    } catch {
      // fall through to error handling
    }
  }

  if (!response.ok) {
    throw new Error(`Error fetching statement: ${response.status} ${response.statusText}`);
  }

  const data: StatementApiResponseItem[] = (await response.json()) as StatementApiResponseItem[];

  const lines: StatementLine[] = data.map((item) => {
    const [nr1 = "", nr2 = "", nr3 = ""] = item.narratives || [];
    return {
      postingDate: item.postingDate,
      amount: item.amount,
      drCr: item.drCr,
      nr1,
      nr2,
      nr3,
      isActive: item.isActive ? 1 : 0,
      isDeleted: item.isDeleted ? 1 : 0,
      debit: item.debit,
      credit: item.credit,
    };
  });

  return lines;
}
