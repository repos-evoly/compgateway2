"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import {
  CertifiedBankStatementRequest,
  CertifiedBankStatementRequestWithID,
  ServicesRequest,
} from "./types"; // <-- Import from the single source
import { throwApiError } from "@/app/helpers/handleApiError";


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
    await throwApiError(
      response,
      "Failed to fetch Certified Bank Statements."
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
    await throwApiError(
      response,
      `Failed to fetch Certified Bank Statement #${id}.`
    );
  }

  const apiData = (await response.json()) as ApiCertifiedBankStatement;
  return transformApiToFormShape(apiData);
}

/**
 * Transform the API shape to the shape the form needs.
 */
function transformApiToFormShape(
  apiItem: ApiCertifiedBankStatement,
): CertifiedBankStatementRequestWithID {
  /* ensure we always have a non-null object */
  const srv = apiItem.serviceRequests ?? {
    reactivateIdfaali: false,
    deactivateIdfaali: false,
    resetDigitalBankPassword: false,
    resendMobileBankingPin: false,
    changePhoneNumber: false,
  };

  const stmt = apiItem.statementRequest ?? {
    currentAccountStatementArabic: false,
    currentAccountStatementEnglish: false,
    visaAccountStatement: false,
    accountStatement: false,
    journalMovement: false,
    nonFinancialCommitment: false,
    fromDate: "",
    toDate: "",
  };

  return {
    id: apiItem.id,
    accountHolderName: apiItem.accountHolderName ?? "",
    authorizedOnTheAccountName: apiItem.authorizedOnTheAccountName ?? "",
    accountNumber: apiItem.accountNumber ?? undefined,
    oldAccountNumber: apiItem.oldAccountNumber ?? undefined,
    newAccountNumber: apiItem.newAccountNumber ?? undefined,

    /* safe serviceRequests */
    serviceRequests: {
      reactivateIdfaali: srv.reactivateIdfaali,
      deactivateIdfaali: srv.deactivateIdfaali,
      resetDigitalBankPassword: srv.resetDigitalBankPassword,
      resendMobileBankingPin: srv.resendMobileBankingPin,
      changePhoneNumber: srv.changePhoneNumber,
    },

    /* safe statementRequest */
    statementRequest: {
      currentAccountStatement: {
        arabic:   stmt.currentAccountStatementArabic   ?? false,
        english:  stmt.currentAccountStatementEnglish ?? false,
      },
      visaAccountStatement:  stmt.visaAccountStatement  ?? false,
      fromDate:              stmt.fromDate              ?? "",
      toDate:                stmt.toDate                ?? "",
      accountStatement:      stmt.accountStatement      ?? false,
      journalMovement:       stmt.journalMovement       ?? false,
      nonFinancialCommitment:stmt.nonFinancialCommitment?? false,
    },
  };
}




/**
 * Create a new Certified Bank Statement.
 * Converts the form-shape payload to the API shape, then maps the response
 * back to the form/grid shape you work with elsewhere.
 */
export async function createCertifiedBankStatement(
  payload: CertifiedBankStatementRequest
): Promise<CertifiedBankStatementRequestWithID> {
  // 1) Map form fields ➜ API fields
  const apiBody = {
    accountHolderName: payload.accountHolderName ?? null,
    authorizedOnTheAccountName: payload.authorizedOnTheAccountName ?? null,
    accountNumber: payload.accountNumber ?? null,
    oldAccountNumber: payload.oldAccountNumber ?? null,
    newAccountNumber: payload.newAccountNumber ?? null,
    serviceRequests: {
      reactivateIdfaali: payload.serviceRequests?.reactivateIdfaali ?? false,
      deactivateIdfaali: payload.serviceRequests?.deactivateIdfaali ?? false,
      resetDigitalBankPassword:
        payload.serviceRequests?.resetDigitalBankPassword ?? false,
      resendMobileBankingPin:
        payload.serviceRequests?.resendMobileBankingPin ?? false,
      changePhoneNumber: payload.serviceRequests?.changePhoneNumber ?? false,
    },
    statementRequest: {
      currentAccountStatementArabic:
        payload.statementRequest?.currentAccountStatement?.arabic ?? false,
      currentAccountStatementEnglish:
        payload.statementRequest?.currentAccountStatement?.english ?? false,
      visaAccountStatement:
        payload.statementRequest?.visaAccountStatement ?? false,
      accountStatement: payload.statementRequest?.accountStatement ?? false,
      journalMovement: payload.statementRequest?.journalMovement ?? false,
      nonFinancialCommitment:
        payload.statementRequest?.nonFinancialCommitment ?? false,
      fromDate: payload.statementRequest?.fromDate ?? null,
      toDate: payload.statementRequest?.toDate ?? null,
    },
  };

  // 2) POST to the API
  const response = await fetch(
    `${baseUrl}/certifiedbankstatementrequests`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(apiBody),
    }
  );

  // 3) Handle errors (throws on non-2xx)
  if (!response.ok) {
    await throwApiError(
      response,
      "Failed to create Certified Bank Statement."
    );
  }

  // 4) Map API ➜ form shape and return
  const apiResult = (await response.json()) as ApiCertifiedBankStatement;
  return transformApiToFormShape(apiResult);
}
