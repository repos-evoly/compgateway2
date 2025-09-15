// app/(wherever)/certifiedbankstatements/services.ts
"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import {
  CertifiedBankStatementRequest,
  CertifiedBankStatementRequestWithID,
  ServicesRequest,
} from "./types";
import { throwApiError } from "@/app/helpers/handleApiError";

/**
 * The raw shape the API returns for each statement
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
  totalAmountLyd?: number | null;
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

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_API || "http://10.3.3.11/compgateapi/api";

const shouldRefresh = (s: number) => s === 401 || s === 403;

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
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  const { searchTerm, searchBy, page, limit } = params || {};
  const url = new URL(`${BASE_URL}/certifiedbankstatementrequests`);

  if (page) url.searchParams.set("page", String(page));
  if (limit) url.searchParams.set("limit", String(limit));
  if (searchTerm) url.searchParams.set("searchTerm", searchTerm);
  if (searchBy) url.searchParams.set("searchBy", searchBy);

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: { Authorization: `Bearer ${bearer}` },
    cache: "no-store",
  });

  let response = await fetch(url.toString(), init(token));

  if (shouldRefresh(response.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url.toString(), init(token));
    } catch {
      // fall through to shared error handling
    }
  }

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch Certified Bank Statements.");
  }

  const result = (await response.json()) as GetCertifiedBankStatementsResponse;

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
 * and return it in the shape the form expects.
 */
export async function getCertifiedBankStatementById(
  id: number
): Promise<CertifiedBankStatementRequestWithID> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const url = `${BASE_URL}/certifiedbankstatementrequests/${id}`;

  const init = (bearer: string): RequestInit => ({
    method: "GET",
    headers: { Authorization: `Bearer ${bearer}` },
    cache: "no-store",
  });

  let response = await fetch(url, init(token));

  if (shouldRefresh(response.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

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
  apiItem: ApiCertifiedBankStatement
): CertifiedBankStatementRequestWithID {
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
    totalAmountLyd: apiItem.totalAmountLyd ?? 0,

    serviceRequests: {
      reactivateIdfaali: srv.reactivateIdfaali,
      deactivateIdfaali: srv.deactivateIdfaali,
      resetDigitalBankPassword: srv.resetDigitalBankPassword,
      resendMobileBankingPin: srv.resendMobileBankingPin,
      changePhoneNumber: srv.changePhoneNumber,
    },

    statementRequest: {
      currentAccountStatement: {
        arabic: stmt.currentAccountStatementArabic ?? false,
        english: stmt.currentAccountStatementEnglish ?? false,
      },
      visaAccountStatement: stmt.visaAccountStatement ?? false,
      fromDate: stmt.fromDate ?? "",
      toDate: stmt.toDate ?? "",
      accountStatement: stmt.accountStatement ?? false,
      journalMovement: stmt.journalMovement ?? false,
      nonFinancialCommitment: stmt.nonFinancialCommitment ?? false,
    },
  };
}

/**
 * Create a new Certified Bank Statement.
 */
export async function createCertifiedBankStatement(
  payload: CertifiedBankStatementRequest
): Promise<CertifiedBankStatementRequestWithID> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

  const apiBody = {
    accountHolderName: payload.accountHolderName ?? null,
    authorizedOnTheAccountName: payload.authorizedOnTheAccountName ?? null,
    accountNumber: payload.accountNumber ?? null,
    oldAccountNumber: payload.oldAccountNumber ?? null,
    newAccountNumber: payload.newAccountNumber ?? null,
    totalAmountLyd: payload.totalAmountLyd ?? 0,
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

  const url = `${BASE_URL}/certifiedbankstatementrequests`;

  const init = (bearer: string): RequestInit => ({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
    },
    body: JSON.stringify(apiBody),
    cache: "no-store",
  });

  let response = await fetch(url, init(token));

  if (shouldRefresh(response.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(
      response,
      "Failed to create Certified Bank Statement."
    );
  }

  const apiResult = (await response.json()) as ApiCertifiedBankStatement;
  return transformApiToFormShape(apiResult);
}

/**
 * Update an existing Certified Bank Statement.
 */
export async function updateCertifiedBankStatement(
  id: number,
  payload: CertifiedBankStatementRequest
): Promise<CertifiedBankStatementRequestWithID> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }

  let token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies");
  }

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

  const url = `${BASE_URL}/certifiedbankstatementrequests/${id}`;

  const init = (bearer: string): RequestInit => ({
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
    },
    body: JSON.stringify(apiBody),
    cache: "no-store",
  });

  let response = await fetch(url, init(token));

  if (shouldRefresh(response.status)) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
      response = await fetch(url, init(token));
    } catch {
      // fall through
    }
  }

  if (!response.ok) {
    await throwApiError(
      response,
      "Failed to update Certified Bank Statement."
    );
  }

  const apiResult = (await response.json()) as ApiCertifiedBankStatement;
  return transformApiToFormShape(apiResult);
}
