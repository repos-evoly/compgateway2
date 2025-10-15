"use client";

import React from "react";
import { FiUser, FiCreditCard, FiFileText } from "react-icons/fi";

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
  reason?: string;
  totalAmountLyd?: number;
};

/**
 * 2) Arrays describing fields for each step
 */

// Step 1 fields:
//   accountHolderName, authorizedOnTheAccountName, accountNumber
export const step1StatementInputs = [
  {
    name: "accountNumber",
    label: "accountNumber",
    icon: <FiCreditCard />,
    type: "number",
    maskingFormat: "0000-000000-000",
  },
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
];

// Step 2 fields:
//   oldAccountNumber, newAccountNumber, statementRequest
export const step2StatementInputs = [
  // statementRequest => custom UI (checkboxes, date fields, etc.)
  {
    name: "statementRequest",
    label: "statementRequest",
    icon: <FiFileText />,
    type: "statementRequest",
  },
];
