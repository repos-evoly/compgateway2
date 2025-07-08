"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  JSX,
} from "react";
import {
  FaUniversity,
  FaCheck,
  FaHandshake,
  FaMoneyCheckAlt,
  FaGlobe,
  FaCreditCard,
  FaReceipt,
  FaClipboardList,
  FaFileInvoice,
  FaSignOutAlt,
  FaCog,
  FaTasks,
  FaFileSignature,
  FaLanguage,
  FaTachometerAlt,
  FaUsers,
  FaCoins,
} from "react-icons/fa";
import { IoWalletSharp, IoEarth } from "react-icons/io5";
import { MdRequestQuote } from "react-icons/md";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { BiDollarCircle, BiUpload, BiTransferAlt } from "react-icons/bi";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type HeaderInfo = {
  label: string; // Label key for translation
  icon?: JSX.Element; // Optional icon for the header
  description?: string; // Key for the description translation
};

type GlobalContextType = {
  headerInfo: HeaderInfo;
  setHeaderInfo: (info: HeaderInfo) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

/* ------------------------------------------------------------------ */
/* Icons & Descriptions                                               */
/* ------------------------------------------------------------------ */
const ICONS: Record<string, { icon: JSX.Element; description: string }> = {
  dashboard: {
    icon: <FaTachometerAlt />,
    description: "dashboardDescription",
  },
  statementOfAccount: {
    icon: <FaFileInvoice />,
    description: "statementOfAccountDescription",
  },
  employees: {
    icon: <FaUsers />,
    description: "employeesDescription",
  },
  representatives: {
    icon: <FaUsers />,
    description: "representativesDescription",
  },
  "transfer.label": {
    icon: <IoWalletSharp />,
    description: "transferDescription",
  },
  "transfer.in": {
    icon: <FaUniversity />,
    description: "transferInDescription",
  },
  "transfer.out": {
    icon: <IoEarth />,
    description: "transferOutDescription",
  },
  "requests.label": {
    icon: <MdRequestQuote />,
    description: "requestsDescription",
  },
  "requests.checkBook": {
    icon: <FaMoneyCheckAlt />,
    description: "checkBookDescription",
  },
  "requests.certifiedCheck": {
    icon: <FaCheck />,
    description: "certifiedCheckDescription",
  },
  "requests.guaranteeLetter": {
    icon: <FaFileSignature />,
    description: "guaranteeLetterDescription",
  },
  "requests.creditFacility": {
    icon: <FaHandshake />,
    description: "creditFacilityDescription",
  },
  "requests.visa": {
    icon: <FaCreditCard />,
    description: "visaDescription",
  },
  "requests.certifiedBankStatement": {
    icon: <FaClipboardList />,
    description: "certifiedBankStatementDescription",
  },
  "requests.rtgs": {
    icon: <FaReceipt />,
    description: "rtgsDescription",
  },
  "requests.foreign": {
    icon: <FaGlobe />,
    description: "foreignRequestsDescription",
  },
  "requests.cbl": {
    icon: <FaClipboardList />,
    description: "cblDescription",
  },
  currencies: {
    icon: <FaCoins />,
    description: "currenciesDescription",
  },
  "salaryLocalization.title": {
    icon: <HiOutlineCurrencyDollar />,
    description: "salaryLocalizationDescription",
  },
  "salaryLocalization.salaries": {
    icon: <BiDollarCircle />,
    description: "salariesDescription",
  },
  "salaryLocalization.uploadFiles": {
    icon: <BiUpload />,
    description: "uploadFilesDescription",
  },
  "salaryLocalization.salariesTransfer": {
    icon: <BiTransferAlt />,
    description: "salariesTransferDescription",
  },
  documentary: {
    icon: <FaFileInvoice />,
    description: "documentaryDescription",
  },
  followUp: {
    icon: <FaTasks />,
    description: "followUpDescription",
  },
  settings: {
    icon: <FaCog />,
    description: "settingsDescription",
  },
  changeLanguage: {
    icon: <FaLanguage />,
    description: "changeLanguageDescription",
  },
  logout: {
    icon: <FaSignOutAlt />,
    description: "logoutDescription",
  },
  "customizations.label": {
    icon: <HiOutlineCurrencyDollar />,
    description: "customizationsDescription",
  },
  "customizations.banks": {
    icon: <BiDollarCircle />,
    description: "banksDescription",
  },
  "customizations.commissions": {
    icon: <BiUpload />,
    description: "commissionsDescription",
  },
  "customizations.limits": {
    icon: <BiTransferAlt />,
    description: "limitsDescription",
  },
};

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */
export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [headerInfo, setHeaderInfoState] = useState<HeaderInfo>({
    label: "defaultTitle",
    description: "defaultDescription",
  });

  // Restore header info on page reload
  useEffect(() => {
    const storedLabel = localStorage.getItem("headerTitleLabel");
    if (storedLabel) {
      setHeaderInfoState({
        label: storedLabel,
        icon: ICONS[storedLabel]?.icon || undefined,
        description: ICONS[storedLabel]?.description || "defaultDescription",
      });
    }
  }, []);

  // Update header info and persist it
  const setHeaderInfo = (info: { label: string }) => {
    setHeaderInfoState({
      label: info.label,
      icon: ICONS[info.label]?.icon || undefined,
      description: ICONS[info.label]?.description || "defaultDescription",
    });
    localStorage.setItem("headerTitleLabel", info.label);
  };

  return (
    <GlobalContext.Provider value={{ headerInfo, setHeaderInfo }}>
      {children}
    </GlobalContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
