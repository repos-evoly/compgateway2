"use client";

/** Service options */
export type ServicesOptions =
  | "reactivateIdfaali"
  | "deactivateIdfaali"
  | "resetDigitalBankPassword"
  | "resendMobileBankingPin"
  | "changePhoneNumber";

/** Grouped service requests */
export type ServicesRequest = {
  [K in ServicesOptions]: boolean;
};

/** Statement request details */
export type StatementRequest = {
  currentAccountStatement?: {
    arabic?: boolean;
    english?: boolean;
  };
  visaAccountStatement?: boolean;
  fromDate?: string;
  toDate?: string;
  accountStatement?: boolean;
  journalMovement?: boolean;
  nonFinancialCommitment?: boolean;
};

/** Base shape (without ID) */
export type CertifiedBankStatementRequest = {
  accountHolderName?: string;
  authorizedOnTheAccountName?: string;
  accountNumber?: number;
  serviceRequests?: ServicesRequest;
  oldAccountNumber?: number;
  newAccountNumber?: number;
  statementRequest?: StatementRequest;
  totalAmountLyd?: number;
};

/** Extended shape with ID, status and rejectReason */
export type CertifiedBankStatementRequestWithID = CertifiedBankStatementRequest & {
  id: number;
  status?: string;
  rejectReason?: string;
};


