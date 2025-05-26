import React from "react";

export type InternalFormValues = {
  from: string;
  to: string;
  value: number;
  description: string;

  // Commented / optional fields:
  commision?: number;
  selectField?: string;
  recurring?: boolean;
  date?: string | null;
  receiverOrSender?: string;
  transactionCategoryId?: number;
  currencyId?: number | null;
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
  transactionCategoryId: number;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currencyId: number; // or null if unknown
  description: string;
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
  currencyId: number;
  description: string;
  createdAt: string;
  updatedAt: string;
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
