/* --------------------------------------------------------------------------
   services/branches.ts
   – Helper to fetch all bank branches via the Next.js proxy.
   -------------------------------------------------------------------------- */

import { handleApiResponse } from "@/app/helpers/apiResponse";

const API_BASE = "/Companygw/api/branches" as const;

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

export const getBranches = async (): Promise<Branch[]> => {
  const response = await fetch(API_BASE, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await handleApiResponse<ApiResponse>(
    response,
    "Failed to fetch branches"
  );
  return data.details.branches;
};
