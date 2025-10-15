export type AccountInfo = {
  accountString: string;
  availableBalance: number;
  debitBalance: number;
  transferType: string;
  companyName: string;
  accountName: string;
  currency: string;
  branchCode: string;
  branchName: string;
};

const API_ROOT = "/Companygw/api" as const;

export async function CheckAccount(accountNumber: string): Promise<AccountInfo[]> {
  const response = await fetch(
    `${API_ROOT}/transfers/accounts?account=${encodeURIComponent(accountNumber)}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  return handleApiResponse<AccountInfo[]>(
    response,
    "Failed to fetch account info."
  );
}
import { handleApiResponse } from "@/app/helpers/apiResponse";
