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
  FaChevronDown,
  FaChevronUp,
  FaUser,
} from "react-icons/fa";
import { IoWalletSharp, IoEarth } from "react-icons/io5";
import { MdRequestQuote } from "react-icons/md";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { BiDollarCircle, BiUpload, BiTransferAlt } from "react-icons/bi";

type HeaderInfo = {
  label: string; // Label key for translation
  icon?: JSX.Element; // Optional icon for the header
};

type GlobalContextType = {
  headerInfo: HeaderInfo;
  setHeaderInfo: (info: HeaderInfo) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Move the ICONS constant outside the component to avoid dependency issues
const ICONS: Record<string, JSX.Element> = {
  statementOfAccount: <FaFileInvoice />,
  "transfer.label": <IoWalletSharp />,
  "transfer.in": <FaUniversity />,
  "transfer.out": <IoEarth />,
  "requests.label": <MdRequestQuote />,
  "requests.checkBook": <FaMoneyCheckAlt />,
  "requests.certifiedCheck": <FaCheck />,
  "requests.guaranteeLetter": <FaFileSignature />,
  "requests.creditFacility": <FaHandshake />,
  "requests.visa": <FaCreditCard />,
  "requests.rtgs": <FaReceipt />,
  "requests.foreign": <FaGlobe />,
  "requests.cbl": <FaClipboardList />,
  "salaryLocalization.title": <HiOutlineCurrencyDollar />,
  "salaryLocalization.salaries": <BiDollarCircle />,
  "salaryLocalization.uploadFiles": <BiUpload />,
  "salaryLocalization.salariesTransfer": <BiTransferAlt />,
  documentary: <FaFileInvoice />,
  followUp: <FaTasks />,
  settings: <FaCog />,
  changeLanguage: <FaLanguage />,
  logout: <FaSignOutAlt />,
  FaUser: <FaUser />,
  FaChevronDown: <FaChevronDown />,
  FaChevronUp: <FaChevronUp />,
};

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [headerInfo, setHeaderInfoState] = useState<HeaderInfo>({
    label: "defaultTitle",
  });

  // Restore header info on page reload
  useEffect(() => {
    const storedLabel = localStorage.getItem("headerTitleLabel");
    if (storedLabel) {
      setHeaderInfoState({
        label: storedLabel,
        icon: ICONS[storedLabel] || undefined, // Find the icon based on the label
      });
    }
  }, []); // Removed dependency on ICONS as it is now outside the component

  // Set the header info and store in localStorage
  const setHeaderInfo = (info: HeaderInfo) => {
    setHeaderInfoState(info);
    localStorage.setItem("headerTitleLabel", info.label);
  };

  return (
    <GlobalContext.Provider value={{ headerInfo, setHeaderInfo }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
