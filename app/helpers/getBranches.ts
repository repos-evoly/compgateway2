/* --------------------------------------------------------------------------
   services/branches.ts
   – Helper to fetch all bank branches.
   – Uses the access-token stored in cookies; throws detailed errors via
     throwApiError; returns a strongly-typed array of Branch objects.
   – No missing lines.  Strict TypeScript, no “any”.
   -------------------------------------------------------------------------- */

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { throwApiError } from "@/app/helpers/handleApiError";

/* ------------------------------------------------------------------ */
/* Environment                                                         */
/* ------------------------------------------------------------------ */
const baseUrl = process.env.NEXT_PUBLIC_BASE_API;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export type Branch = {
  branchNumber: string;
  branchName: string;
  branchMnemonic: string;
};

type ApiHeader = {
  system: string;
  function: string;
  referenceId: string;
  sentTime: string;
  middlewareId: string;
  returnCode: string;
  returnMessageCode: string;
  returnMessage: string;
};

type ApiResponse = {
  header: ApiHeader;
  details: {
    branches: Branch[];
  };
};

/* ------------------------------------------------------------------ */
/* Helper                                                              */
/* ------------------------------------------------------------------ */
export const getBranches = async (): Promise<Branch[]> => {
  if (!baseUrl) {
    throw new Error("Base URL is not defined");
  }

  const token = await getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found");
  }

  const url = `${baseUrl}/branches`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw await throwApiError(response, "Failed to fetch branches");
  }

  const data: ApiResponse = await response.json();
  return data.details.branches;
};
