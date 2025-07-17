"use client";

import React from "react";
import {
  FiCalendar,
  FiUser,
  FiCreditCard,
  FiSmartphone,
  FiFileText,
  FiDollarSign,
  FiShield,
} from "react-icons/fi";

/**
 * Step 1 fields:
 * - branch
 * - date
 * - accountHolderName
 * - accountNumber
 * - nationalId
 * - phoneNumberLinkedToNationalId
 */
export const step1VisaInputs = [
  {
    name: "accountNumber",
    label: "accountNumber",
    icon: <FiCreditCard />,
    type: "text",
    maskingFormat: "0000-000000-000",
    component: "InputSelectCombo",
  },

  {
    name: "branch",
    label: "branch",
    icon: <FiFileText />,
    type: "text",
  },
  {
    name: "date",
    label: "date",
    icon: <FiCalendar />,
    type: "date",
  },
  {
    name: "accountHolderName",
    label: "accountHolderName",
    icon: <FiUser />,
    type: "text",
  },

  {
    name: "nationalId",
    label: "nationalId",
    icon: <FiCreditCard />,
    type: "number",
    maskingFormat: "000000000000",
  },
  {
    name: "phoneNumberLinkedToNationalId",
    label: "phoneNumberLinkedToNationalId",
    icon: <FiSmartphone />,
    type: "number",
    maskingFormat: "0000000000",
  },
];

/**
 * Step 2 fields:
 * - cbl
 * - cardMovementApproval
 * - cardUsingAcknowledgment
 * - foreignAmount
 * - localAmount
 * - pldedge
 */
export const step2VisaInputs = [
  {
    name: "cbl",
    label: "cbl",
    icon: <FiFileText />,
    type: "number",
  },
  {
    name: "cardMovementApproval",
    label: "cardMovementApproval",
    icon: <FiShield />,
    type: "text",
  },
  {
    name: "cardUsingAcknowledgment",
    label: "cardUsingAcknowledgment",
    icon: <FiShield />,
    type: "text",
  },
  {
    name: "foreignAmount",
    label: "foreignAmount",
    icon: <FiDollarSign />,
    type: "number",
  },
  {
    name: "localAmount",
    label: "localAmount",
    icon: <FiDollarSign />,
    type: "number",
  },
  {
    name: "pldedge",
    label: "pldedge",
    icon: <FiFileText />,
    type: "text",
  },
];
