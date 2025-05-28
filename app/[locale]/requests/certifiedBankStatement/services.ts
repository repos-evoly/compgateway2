"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import {
  CertifiedBankStatementRequestWithID,
  ServicesRequest,
} from "./types"; // <-- Import from the single source

/**
 * The raw shape the API returns for each statement
 * (If you don't want to define it, you can inline or skip, 
 *  but let's keep it here for clarity.)
 */
type ApiCertifiedBankStatement = {
  id: number;
  userId: number;
  accountHolderName: string | null;
  authorizedOnTheAccountName: string | null;
  accountNumber: number | null;
  oldAccountNumber: number | null;
  newAccountNumber: number | null;
  serviceRequests: ServicesRequest;
  statementRequest: {
    currentAccountStatementArabic: boolean | null;
    currentAccountStatementEnglish: boolean | null;
    visaAccountStatement: boolean | null;
    accountStatement: boolean | null;
    journalMovement: boolean | null;
    nonFinancialCommitment: boolean | null;
    fromDate: string | null;
    toDate: string | null;
  };
  status: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  companyId: number;
};

/**
 * The shape of the paginated response 
 */
type GetCertifiedBankStatementsResponse = {
  data: ApiCertifiedBankStatement[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
};

// Token & base URL
const token = getAccessTokenFromCookies();
const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_API is not defined");
}
if (!token) {
  throw new Error("No access token found in cookies");
}

/**
 * Fetch a list of Certified Bank Statements from the API,
 * with optional pagination/search, returning them in the 
 * shape your grid expects (CertifiedBankStatementRequestWithID[]).
 */
export async function getCertifiedBankStatements(params?: {
  searchTerm?: string;
  searchBy?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: CertifiedBankStatementRequestWithID[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}> {
  const { searchTerm, searchBy, page, limit } = params || {};
  const url = new URL(`${baseUrl}/certifiedbankstatementrequests`);

  if (page) url.searchParams.set("page", String(page));
  if (limit) url.searchParams.set("limit", String(limit));
  if (searchTerm) url.searchParams.set("searchTerm", searchTerm);
  if (searchBy) url.searchParams.set("searchBy", searchBy);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Certified Bank Statements. Status: ${response.status}`
    );
  }

  const result = (await response.json()) as GetCertifiedBankStatementsResponse;

  // Transform each API record into the shape the form/grid expects
  const transformedData: CertifiedBankStatementRequestWithID[] = result.data.map(
    (apiItem) => transformApiToFormShape(apiItem)
  );

  console.log("Transformed Certified Bank Statements:", transformedData);
  return {
    data: transformedData,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    totalRecords: result.totalRecords,
  };
}

/**
 * Fetch a single Certified Bank Statement by ID 
 * and return it in the shape the **form** expects.
 */
export async function getCertifiedBankStatementById(
  id: number
): Promise<CertifiedBankStatementRequestWithID> {
  const response = await fetch(
    `${baseUrl}/certifiedbankstatementrequests/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Certified Bank Statement #${id}. Status: ${response.status}`
    );
  }

  const apiData = (await response.json()) as ApiCertifiedBankStatement;
  return transformApiToFormShape(apiData);
}

/**
 * Transform the API shape to the shape the form needs.
 */
function transformApiToFormShape(
  apiItem: ApiCertifiedBankStatement
): CertifiedBankStatementRequestWithID {
  return {
    // ID
    id: apiItem.id,
    // Basic fields
    accountHolderName: apiItem.accountHolderName ?? "",
    authorizedOnTheAccountName: apiItem.authorizedOnTheAccountName ?? "",
    accountNumber: apiItem.accountNumber ?? undefined,
    oldAccountNumber: apiItem.oldAccountNumber ?? undefined,
    newAccountNumber: apiItem.newAccountNumber ?? undefined,
    // serviceRequests (already typed)
    serviceRequests: {
      reactivateIdfaali: apiItem.serviceRequests.reactivateIdfaali,
      deactivateIdfaali: apiItem.serviceRequests.deactivateIdfaali,
      resetDigitalBankPassword:
        apiItem.serviceRequests.resetDigitalBankPassword,
      resendMobileBankingPin: apiItem.serviceRequests.resendMobileBankingPin,
      changePhoneNumber: apiItem.serviceRequests.changePhoneNumber,
    },
    // statementRequest => mapped from "xxxArabic", "xxxEnglish", etc.
    statementRequest: {
      currentAccountStatement: {
        arabic: apiItem.statementRequest.currentAccountStatementArabic ?? false,
        english:
          apiItem.statementRequest.currentAccountStatementEnglish ?? false,
      },
      visaAccountStatement:
        apiItem.statementRequest.visaAccountStatement ?? false,
      fromDate: apiItem.statementRequest.fromDate ?? "",
      toDate: apiItem.statementRequest.toDate ?? "",
      accountStatement: apiItem.statementRequest.accountStatement ?? false,
      journalMovement: apiItem.statementRequest.journalMovement ?? false,
      nonFinancialCommitment:
        apiItem.statementRequest.nonFinancialCommitment ?? false,
    },
  };
}
