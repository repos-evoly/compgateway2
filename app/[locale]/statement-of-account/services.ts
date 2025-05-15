// helpers/statementOfAccount/getStatement.ts

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler"; // adjust the import path

type FilterValues = {
  account: string;
  fromDate: string;
  toDate: string;
};

type StatementApiResponseItem = {
  postingDate: string;
  narratives: string[];
  amount: number;
  drCr: string;
};

export type StatementLine = {
  postingDate: string;
  amount: number;
  drCr: string;
  nr1: string;
  nr2: string;
  nr3: string;
};

/**
 * Retrieves the statement of account from the external API via GET,
 * passing `account`, `fromDate`, and `toDate` as query parameters.
 * Uses the token from cookies to authorize the request.
 */
export async function getStatement({
  account,
  fromDate,
  toDate,
}: FilterValues): Promise<StatementLine[]> {
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
    };
  });

  return lines;
}