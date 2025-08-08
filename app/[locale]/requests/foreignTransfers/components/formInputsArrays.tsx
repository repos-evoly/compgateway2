"use client";

import React from "react";
import {
  FiMapPin,
  FiUser,
  FiGlobe,
  FiCreditCard,
  FiHome,
  FiDollarSign,
  FiAlignJustify,
  FiPaperclip,
} from "react-icons/fi";

/**
 * Step 1 fields:
 *   - toBank
 *   - branch
 *   - residentSupplierName
 *   - residentSupplierNationality
 *   - nonResidentSupplierPassportNumber
 *   - placeOfIssue
 *   - dateOfIssue
 *   - nonResidentSupplierNationality
 *   - nonResidentAddress
 *
 * We’ll break these into one group or multiple groups if you prefer headings.
 */

export const step1Inputs = [
  {
    name: "toBank",
    label: "toBank",
    icon: <FiMapPin />,
    type: "text",
  },
  // {
  //   name: "branch",
  //   label: "branch",
  //   icon: <FiMapPin />,
  //   type: "text",
  // },
  {
    name: "residentSupplierName",
    label: "residentSuppName",
    icon: <FiUser />,
    type: "text",
  },
  {
    name: "residentSupplierNationality",
    label: "residentSuppNationality",
    icon: <FiGlobe />,
    type: "text",
  },
  {
    name: "nonResidentPassportNumber",
    label: "nonResidentPassport",
    icon: <FiCreditCard />,
    type: "number",
  },
  {
    name: "placeOfIssue",
    label: "placeOfIssue",
    icon: <FiMapPin />,
    type: "text",
  },
  {
    name: "dateOfIssue",
    label: "dateOfIssue",
    icon: null, // We’ll treat this specially for a DatePicker
    type: "datePicker",
  },
  {
    name: "nonResidentNationality",
    label: "nonResidentSuppNationality",
    icon: <FiGlobe />,
    type: "text",
  },
  {
    name: "nonResidentAddress",
    label: "nonResidentSuppaddress",
    icon: <FiHome />,
    type: "text",
  },
];

/**
 * Step 2 fields:
 *   - transferAmount
 *   - toCountry
 *   - beneficiaryName
 *   - beneficiaryAddress
 *   - externalBankName
 *   - externalBankAddress
 *   - transferToAccountNumber
 *   - transferToAddress
 *   - accountholderName
 *   - permenantAddress
 *   - purposeOfTransfer
 */
export const step2Inputs = [
  {
    name: "transferAmount",
    label: "transferAmount",
    icon: <FiDollarSign />,
    type: "number",
  },
  {
    name: "toCountry",
    label: "destinationCountry",
    icon: <FiGlobe />,
    type: "text",
  },
  {
    name: "beneficiaryName",
    label: "beneficiaryName",
    icon: <FiUser />,
    type: "text",
  },
  {
    name: "beneficiaryAddress",
    label: "beneficiaryAddress",
    icon: <FiHome />,
    type: "text",
  },
  {
    name: "externalBankName",
    label: "externalBankName",
    icon: <FiMapPin />,
    type: "text",
  },
  {
    name: "externalBankAddress",
    label: "externalBankAddress",
    icon: <FiHome />,
    type: "text",
  },
  {
    name: "transferToAccountNumber",
    label: "transferToAccount",
    icon: <FiCreditCard />,
    type: "number",
  },
  {
    name: "transferToAddress",
    label: "transferToAddress",
    icon: <FiMapPin />,
    type: "text",
  },
  {
    name: "accountHolderName",
    label: "accountHolderName",
    icon: <FiUser />,
    type: "text",
  },
  {
    name: "permanentAddress",
    label: "payementAddress",
    icon: <FiHome />,
    type: "text",
  },
  {
    name: "purposeOfTransfer",
    label: "purpose",
    icon: <FiAlignJustify />,
    type: "text",
  },
  // NEW upload field
  {
    name: "uploadDocuments",
    label: "Upload Documents",
    icon: <FiPaperclip />,
    type: "file",
    multiple: true, // Indicate multi-file support
  },
];
