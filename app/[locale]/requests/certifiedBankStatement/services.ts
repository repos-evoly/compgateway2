// app/[locale]/certified-bank-statement/services.ts
"use client";

import {
  CertifiedBankStatementRequest,
  CertifiedBankStatementRequestWithID,
  ServicesRequest,
} from "./types";
import { handleApiResponse } from "@/app/helpers/apiResponse";

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

const API_BASE = "/Companygw/api/requests/certified-bank-statement" as const;

const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});

const buildListUrl = (params?: {
  searchTerm?: string;
  searchBy?: string;
  page?: number;
  limit?: number;
}): string => {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.searchTerm) sp.set("searchTerm", params.searchTerm);
  if (params?.searchBy) sp.set("searchBy", params.searchBy);
  const qs = sp.toString();
  return qs ? `${API_BASE}?${qs}` : API_BASE;
};

/**
 * Transform the API shape to the shape the form/page needs.
 * Keeps nested statementRequest while also exposing top-level
 * fromDate/toDate for direct access in grids or actions.
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

  const fromDate = stmt.fromDate ?? "";
  const toDate = stmt.toDate ?? "";

  return {
    id: apiItem.id,
    accountHolderName: apiItem.accountHolderName ?? "",
    authorizedOnTheAccountName: apiItem.authorizedOnTheAccountName ?? "",
    accountNumber: apiItem.accountNumber ?? undefined,
    oldAccountNumber: apiItem.oldAccountNumber ?? undefined,
    newAccountNumber: apiItem.newAccountNumber ?? undefined,
    totalAmountLyd: apiItem.totalAmountLyd ?? 0,

    // top-level convenience fields
    fromDate,
    toDate,

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
      fromDate,
      toDate,
      accountStatement: stmt.accountStatement ?? false,
      journalMovement: stmt.journalMovement ?? false,
      nonFinancialCommitment: stmt.nonFinancialCommitment ?? false,
    },
  };
}

/**
 * Fetch a list of Certified Bank Statements from the API,
 * with optional pagination/search, returning them in the
 * shape your grid expects (CertifiedBankStatementRequestWithID[]).
 * — Also exposes top-level fromDate/toDate for convenience.
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
  const response = await fetch(
    buildListUrl(params),
    withCredentials({ method: "GET" })
  );

  const result = await handleApiResponse<GetCertifiedBankStatementsResponse>(
    response,
    "Failed to fetch Certified Bank Statements."
  );

  const transformedData: CertifiedBankStatementRequestWithID[] = result.data.map(
    (apiItem) => transformApiToFormShape(apiItem)
  );

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
 * and return it in the shape the form/page expects.
 * — Includes top-level fromDate/toDate.
 */
export async function getCertifiedBankStatementById(
  id: number
): Promise<CertifiedBankStatementRequestWithID> {
  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({ method: "GET" })
  );

  const apiData = await handleApiResponse<ApiCertifiedBankStatement>(
    response,
    `Failed to fetch Certified Bank Statement #${id}.`
  );
  return transformApiToFormShape(apiData);
}

/**
 * Create a new Certified Bank Statement.
 */
export async function createCertifiedBankStatement(
  payload: CertifiedBankStatementRequest
): Promise<CertifiedBankStatementRequestWithID> {
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

  const response = await fetch(
    API_BASE,
    withCredentials({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiBody),
    })
  );

  const apiResult = await handleApiResponse<ApiCertifiedBankStatement>(
    response,
    "Failed to create Certified Bank Statement."
  );
  return transformApiToFormShape(apiResult);
}

/**
 * Update an existing Certified Bank Statement.
 */
export async function updateCertifiedBankStatement(
  id: number,
  payload: CertifiedBankStatementRequest
): Promise<CertifiedBankStatementRequestWithID> {
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

  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiBody),
    })
  );

  const apiResult = await handleApiResponse<ApiCertifiedBankStatement>(
    response,
    "Failed to update Certified Bank Statement."
  );
  return transformApiToFormShape(apiResult);
}
