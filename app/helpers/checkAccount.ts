export type AccountInfo = {
  accountString: string;
  availableBalance: number;
  debitBalance: number;
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

  if (!response.ok) {
    throw new Error(`Failed to fetch account info. Status: ${response.status}`);
  }

  return (await response.json()) as AccountInfo[];
}
