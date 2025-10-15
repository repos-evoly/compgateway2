import React from "react";

export type InternalFormValues = {
  from: string;
  to: string;
  value: number;
  description: string;
  beneficiaryId?: number; // New field for beneficiary selection

  // Commented / optional fields:
  commision?: number;
  selectField?: string;
  recurring?: boolean;
  date?: string | null;
  receiverOrSender?: string;
  transactionCategoryId?: number;
  currencyDesc?: string | null;
  economicSectorId?: number;
};

export type InternalFormProps = {
  initialData?: Partial<InternalFormValues>;
  onSubmit?: (values: InternalFormValues) => void;
};

// For the confirmation modal data
export type AdditionalData = {
  fromName?: string;
  toName?: string;
  fromBalance?: string;
};

export type SpecialFieldsDisplayProps = {
  field: {
    name: string;
    type: string;
    startIcon?: React.ReactNode; // replaced `any` with React.ReactNode
    width?: string;
    // label? : string; // optional if needed
  };
  displayType: "account" | "commission";
  t: (key: string) => string;
  disabled?: boolean;
};

// types.ts

export interface TransferPayload {
  transactionCategoryId?: number;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currencyDesc: string;
  currencyId?: number; // kept optional for backward compatibility
  description: string;
  commissionOnRecipient?: boolean; // optional, if your API supports it
  economicSectorId?: number;
}

/**
 * This shape can match what your API actually returns on success from /transfers
 * Adjust as needed
 */
export interface TransferResponse {
  id: number;
  transactionCategoryId: number;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currencyId?: number;
  currencyDesc?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  economicSectorId?: number; // optional if your API supports it
}

export interface TransfersApiResponse {
  data: Array<{
    id: number;
    userId: number;
    categoryName: string;
    fromAccount: string;
    toAccount: string;
    amount: number;
    currencyCode: string;
    packageName: string;
    status: string;
    description: string;
    requestedAt: string;
  }>;
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export type TransfersCommision = {
  servicePackageId: number;
  servicePackageName: string;
  transactionCategoryId: number;
  transactionCategoryName: string;
  transactionCategoryHasLimits: boolean;
  isEnabledForPackage: boolean;
  b2BCommissionPct: number;
  b2BFixedFee: number;
  b2BMinPercentage: number;
  b2BTransactionLimit: number;
  b2CCommissionPct: number;
  b2CFixedFee: number;
  b2CMinPercentage: number;
  b2CTransactionLimit: number;
};

export type EconomicSector = {
  id: number;
  name: string;
  description: string;
};

export type EconomicSectorGetResponse = {
  data: EconomicSector[];
  totalPages: number;
};

export type CheckAccountResponse = {
  accountString: string;
  availableBalance: number;
  debitBalance: number;
  transferType: string;
  companyName: string;
  branchCode: string;
  branchName: string;
  accountName?: string;
  currency: string;
};
