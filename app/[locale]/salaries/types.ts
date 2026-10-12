/* ------------------------------------------------------------------ */
/* Entry type (nested inside a transaction)                           */

import { EmployeeResponse } from "../employees/types";
import type {
  SalaryPaymentChannel,
  WalletRecipientType,
} from "../employees/salaryWalletHelpers";

export type SalaryRecipientType = WalletRecipientType | "accountNumber";

export type SalaryAllocationStatus =
  | "pending"
  | "posting"
  | "funding"
  | "funded"
  | "fundingFailed"
  | "dispatching"
  | "failedBeforeDispatch"
  | "pendingProvider"
  | "pendingProviderResponse"
  | "completed"
  | "failedBeforeSend"
  | "providerRejectedNotProcessed"
  | "failed"
  | "unknown"
  | "manualReview"
  | "reversed"
  | string;

export type SalaryEntryAllocation = {
  id: number;
  salaryEntryId?: number;
  paymentChannel: SalaryPaymentChannel;
  amount: number;
  destination?: string | null;
  recipientType?: SalaryRecipientType | null;
  recipientNameSnapshot?: string | null;
  status: SalaryAllocationStatus;
  commissionAmount?: number;
  senderCommission?: number;
  receiverCommission?: number;
  providerTransactionId?: string | null;
  providerTransactionCode?: string | null;
  providerTxCode?: string | null;
  txCode?: string | null;
  transferResultCode?: string | null;
  transferResultReason?: string | null;
  isTransferred?: boolean;
  transferredAt?: string | null;
  canRetry?: boolean;
  outcomeKnown?: boolean;
  requiresManualReview?: boolean;
  reversalStatus?: string | null;
  reversalReference?: string | null;
};

/* ------------------------------------------------------------------ */
export type TSalaryEntry = {
  id: number;
  employeeId: number;
  employeeName: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  accountNumber?: string | null;
  accountType?: string | null;
  amount: number;
  salary?: number;
  isTransferred: boolean;
  transferResultCode?: string | null;
  transferResultReason?: string | null;
  transferredAt?: string | null;
  allocations?: SalaryEntryAllocation[];
};

export type SalaryWalletBatchItem = {
  id?: number;
  allocationId: number;
  requestIndex: number;
  amount: number;
  destination: string;
  recipientType: SalaryRecipientType;
  status: SalaryAllocationStatus;
  commissionAmount?: number;
  providerTransactionId?: string | null;
  providerTxCode?: string | null;
};

export type SalaryWalletBatch = {
  id: number;
  salaryCycleId?: number;
  rail?: "evoWallet" | "bcdWallet";
  walletChannel?: "evoWallet" | "bcdWallet" | "evo" | "bcd";
  status?: string;
  overallStatus?: string;
  shadowAccount?: string | null;
  coreReferenceId?: string | null;
  coreFundingStatus?: string | null;
  coreFundingReference?: string | null;
  providerBatchId?: string | null;
  batchId?: string | null;
  requestedCount?: number;
  approvedCount?: number;
  failedCount?: number;
  total?: number;
  approved?: number;
  failed?: number;
  requestedTotalAmount?: number;
  successfulTotalAmount?: number;
  failedTotalAmount?: number;
  totalAmount?: number;
  commission?: number;
  totalCommission?: number;
  senderCommission?: number;
  receiverCommission?: number;
  debitAmount?: number;
  lastStatusCheckedAt?: string | null;
  processedAt?: string | null;
  errorMessage?: string | null;
  lastError?: string | null;
  canRetry?: boolean;
  retryAllowed?: boolean;
  canRefreshStatus?: boolean;
  outcomeKnown?: boolean;
  requiresManualReview?: boolean;
  reconciliationAvailable?: boolean;
  lastCheckedAt?: string | null;
  reversalStatus?: string | null;
  reversalAmount?: number;
  reversalReference?: string | null;
  reversalError?: string | null;
  items?: SalaryWalletBatchItem[];
};

/* ------------------------------------------------------------------ */
/* Salary transaction type (API ­/ previous salary transactions)      */
/* ------------------------------------------------------------------ */
export type TSalaryTransaction = {
  id: number;
  salaryMonth: string;            // ISO date-time string (e.g. “2025-08-04T10:01:07.426”)
  totalAmount: number;
  createdAt: string;              // ISO date-time string
  debitAccount: string;
  currency: string;               // e.g. “LYD”
  postedAt: string | null;
  createdByUserId: number;
  postedByUserId: number | null;
  additionalMonth?: string | null;
  entryCount?: number;
  entries: TSalaryEntry[];        // detailed per-employee lines
  status?: string;
  postingStatus?: string;
  bankFeeStatus?: string | null;
  bankFeeError?: string | null;
  postingStartedAt?: string | null;
  postingCompletedAt?: string | null;
  canEdit?: boolean;
  canPost?: boolean;
  canRetry?: boolean;
  canRefreshStatus?: boolean;
  outcomeKnown?: boolean;
  requiresManualReview?: boolean;
  bankReference?: string | null;
  walletBatches?: SalaryWalletBatch[];
};

export type SalaryWalletCapabilities = {
  allocationPrecision?: number;
  commissionMode?: string;
  rails?: {
    bankAccount?: SalaryWalletRailCapability;
    evoWallet?: SalaryWalletRailCapability;
    bcdWallet?: SalaryWalletRailCapability;
  };
  canCreateOrEdit?: boolean;
  canPost?: boolean;
  evoEnabled: boolean;
  bcdEnabled: boolean;
  evoConfigured?: boolean;
  bcdConfigured?: boolean;
  evoUnavailableReason?: string | null;
  bcdUnavailableReason?: string | null;
};

export type SalaryWalletRailCapability = {
  enabled: boolean;
  configured?: boolean;
  available?: boolean;
  recipientTypes?: SalaryRecipientType[];
  reason?: string | null;
};

export type SalaryCyclesResponse = {
  data: TSalaryTransaction[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
};


/* ------------------------------------------------------------------ */
/* Salary record type (current salaries module)                       */
/* ------------------------------------------------------------------ */
export type TSalaryRecord = {
  id: number;
  name: string;
  email: string;
  phone: string;
  salary: number;
  date: string;
  accountNumber: string;
  accountType: "running account" | "wallet";
  sendSalary: boolean;
  canPost: boolean;
};


/* ------------------------------------------------------------------ */
/* Form values type (used by salary forms)                            */
/* ------------------------------------------------------------------ */
export type TSalaryFormValues = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  salary?: number;
  date?: string;
  accountNumber?: string;
  accountType?: "running account" | "wallet";
  sendSalary: boolean;
  canPost: boolean;
};


/**
 * Salary cycle submission payload
 */
export type SalaryCyclePayload = {
  employeeIds: number[];
  salaryAmounts: { [employeeId: number]: number };
  cycleDate: string;
  accountNumbers?: { [employeeId: number]: string };
  accountTypes?: { [employeeId: number]: "account" | "wallet" };
};


export type BankHeader = {
  System: string;
  ReferenceId: string;
  Middleware: string;
  SentTime: string;
  ReturnCode: string;
  ReturnMessageCode: string;
  ReturnMessage: string;
  CurCode: string;
  CurDescrip: string;
};

export type BankGroupAccount = {
  YBCD06HID: string;
  YBCD06DACC: string;
  YBCD06CACC: string;
  YBCD06CNM: string;
  YBCD06AMT: number;
  YBCD06RESP: string;
  YBCD06RESC: string;
  YBCD06RESD: string;
  YBCD06COMA: string;
  YBCD06CNR3: string;
  YBCD06DNR2: string;
};

export type BankDetailsInner = {
  YBCD06DNM: string;
  TotalAmount: number;
  TotalCom: number;
  YBCD06CCY: string;
  YBCD06CCYN: string;
  NumberOfAccounts: number;
  YBCD06DDVDT: string;
  YBCD06CVDT: string;
  GroupAccounts: BankGroupAccount[];
};

export type BankDetails = {
  Details: {
    Details: BankDetailsInner;
  };
};

export type BankResponse = {
  Header: BankHeader;
  Details: BankDetails;
};

export type PostSalaryCycleResponse = {
  cycle: TSalaryTransaction;
  bank?: BankResponse;
  summary?: {
    overallStatus?: string;
    bankAccount?: unknown;
    evoWallet?: unknown;
    bcdWallet?: unknown;
  };
  status?: string;
  message?: string;
};



/* ---------- row types ---------- */
export type SalaryEntryRow = {
  id: number;
  employeeId: number;
  name: string;
  email: string;
  phone: string;
  salary: number;
  date: string;
  accountNumber: string;
  accountType: "account" | "wallet";
  sendSalary: boolean;
  canPost: boolean;
  isTransferred: boolean;
  transferResultCode?: string | null;
  transferResultReason?: string | null;
  transferredAt?: string | null;
  allocations?: SalaryEntryAllocation[];
};
export type EmployeeRow = EmployeeResponse;

export type CommissionConfig = {
  b2BCommissionPct: number;
  b2BFixedFee: number;
  b2CCommissionPct: number;
  b2CFixedFee: number;
};

export type CurrencyLookup = {
  data: Array<{ description: string }>;
};

export type ConfirmModalState = {
  formData: {
    from: string;
    to: string[];
    value: number;
    description: string;
    commissionOnRecipient: boolean;
  };
  commissionAmount: number;
  commissionCurrency: string;
  displayAmount: number;
};
