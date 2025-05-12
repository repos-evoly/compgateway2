"use client";

import React from "react";
import {
  FiUser,
  FiCreditCard,
  FiFileText,
  FiCheckSquare,
} from "react-icons/fi";

/**
 * 1) Type definitions
 */
export type ServicesOptions =
  | "reactivateIdfaali"
  | "deactivateIdfaali"
  | "resetDigitalBankPassword"
  | "resendMobileBankingPin"
  | "changePhoneNumber";

export type ServicesRequest = {
  [K in ServicesOptions]: boolean;
};

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

export type CertifiedBankStatementRequest = {
  accountHolderName?: string;
  authorizedOnTheAccountName?: string;
  accountNumber?: number;
  serviceRequests?: ServicesRequest;
  oldAccountNumber?: number;
  newAccountNumber?: number;
  statementRequest?: StatementRequest;
};

/**
 * 2) Arrays describing fields for each step
 */

// Step 1 fields:
//   accountHolderName, authorizedOnTheAccountName, accountNumber, serviceRequests
export const step1StatementInputs = [
  {
    name: "accountHolderName",
    label: "accountHolderName",
    icon: <FiUser />,
    type: "text",
  },
  {
    name: "authorizedOnTheAccountName",
    label: "authorizedOnTheAccountName",
    icon: <FiUser />,
    type: "text",
  },
  {
    name: "accountNumber",
    label: "accountNumber",
    icon: <FiCreditCard />,
    type: "number",
  },
  // For serviceRequests, you may handle it in a special UI
  // (like multiple checkboxes). We'll treat it as a single "group" for now.
  {
    name: "serviceRequests",
    label: "serviceRequests",
    icon: <FiCheckSquare />,
    type: "serviceRequests",
    // We'll handle it specially in Step1StatementForm
  },
];

// Step 2 fields:
//   oldAccountNumber, newAccountNumber, statementRequest
export const step2StatementInputs = [
  {
    name: "oldAccountNumber",
    label: "oldAccountNumber",
    icon: <FiCreditCard />,
    type: "number",
  },
  {
    name: "newAccountNumber",
    label: "newAccountNumber",
    icon: <FiCreditCard />,
    type: "number",
  },
  // statementRequest => custom UI (checkboxes, date fields, etc.)
  {
    name: "statementRequest",
    label: "statementRequest",
    icon: <FiFileText />,
    type: "statementRequest",
  },
];
