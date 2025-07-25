// helpers/statementOfAccount/getStatement.ts

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler"; // adjust the import path

interface StatementApiResponseItem {
  postingDate: string;
  narratives: string[];
  amount: number;
  drCr: string;
  isActive: boolean;
  isDeleted: boolean;
  debit: number | string;
  credit: number | string;
}

export interface StatementLine {
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
}

/**
 * Retrieves the statement of account from the external API via GET,
 * passing `account`, `fromDate`, and `toDate` as query parameters.
 * Uses the token from cookies to authorize the request.
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
  // 1. Retrieve the token from cookies
  const token = getAccessTokenFromCookies();

  if (!token) {
    throw new Error("No access token found in cookies.");
  }

  // (Optional) parse the token if you need to inspect claims/expiration
  // const parsedToken = parseJwt(token);
  // console.log("Parsed Token:", parsedToken);

  // 2. Build the base URL and query
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) {
    throw new Error(
      "Missing environment variable NEXT_PUBLIC_BASE_API. " +
        "Please set it in your .env file."
    );
  }

  const queryString = new URLSearchParams({ account, fromDate, toDate }).toString();
  const url = `${baseUrl}/transfers/statement?${queryString}`;

  // 3. Make the GET request with an Authorization header
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching statement: ${response.statusText}`);
  }

  // 4. Process the response
  const data: StatementApiResponseItem[] = await response.json();

  // 5. Transform the API data to match the shape needed in your UI
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