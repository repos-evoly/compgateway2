// helpers/statementOfAccount/getStatement.ts

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

import { handleApiResponse } from "@/app/helpers/apiResponse";

const API_ROOT = "/Companygw/api" as const;

export async function getStatement({
  account,
  fromDate,
  toDate,
}: {
  account: string;
  fromDate: string;
  toDate: string;
}): Promise<StatementLine[]> {
  const params = new URLSearchParams({ account, fromDate, toDate });
  const response = await fetch(`${API_ROOT}/transfers/statement?${params.toString()}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await handleApiResponse<StatementApiResponseItem[]>(
    response,
    "Error fetching statement"
  );

  return data.map((item) => {
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
}
