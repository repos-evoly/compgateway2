/* ------------------------------------------------------------------ */
/* Entry type (nested inside a transaction)                           */

import { EmployeeResponse } from "../employees/types";

/* ------------------------------------------------------------------ */
export type TSalaryEntry = {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: number;
  isTransferred: boolean;
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
  entries: TSalaryEntry[];        // detailed per-employee lines
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
  bank: BankResponse;
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
