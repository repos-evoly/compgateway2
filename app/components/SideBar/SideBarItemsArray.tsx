import {
  FaExchangeAlt,
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
} from "react-icons/fa";
import { IoWalletSharp, IoEarth } from "react-icons/io5";
import { MdRequestQuote } from "react-icons/md";
import { HiOutlineCurrencyDollar } from "react-icons/hi";

export const sidebarItems = [
  {
    id: 1,
    label: "statementOfAccount",
    path: "/statement-of-account",
    icon: FaFileInvoice, // More relevant to "Statement of Account"
    children: [],
  },
  {
    id: 2, // Divider
    label: "divider",
    path: "",
    icon: () => null,
    children: [],
  },
  {
    id: 3,
    label: "transfer.label",
    path: "/transfer",
    icon: IoWalletSharp, // General wallet icon for transfers
    children: [
      {
        id: 4,
        label: "transfer.inBank",
        path: "/transfer/in-bank",
        icon: FaUniversity, // Represents transfers within the same bank
      },
      {
        id: 5,
        label: "transfer.betweenBanks",
        path: "/transfer/between-banks",
        icon: FaExchangeAlt, // Icon for exchange between banks
      },
      {
        id: 6,
        label: "transfer.out",
        path: "/transfer/external",
        icon: IoEarth, // Represents external (global) transfers
      },
    ],
  },
  {
    id: 7, // Divider
    label: "divider",
    path: "",
    icon: () => null,
    children: [],
  },
  {
    id: 8,
    label: "requests.label",
    path: "/requests",
    icon: MdRequestQuote, // General icon for "Requests"
    children: [
      {
        id: 9,
        label: "requests.checkBook",
        path: "/checkbook",
        icon: FaMoneyCheckAlt, // Icon for checkbook requests
      },
      {
        id: 10,
        label: "requests.certifiedCheck",
        path: "/checkRequest",
        icon: FaCheck, // Certified check requests
      },
      {
        id: 11,
        label: "requests.guaranteeLetter",
        path: "/requests/guarantee-letter",
        icon: FaFileSignature, // Letter of guarantee request
      },
      {
        id: 12,
        label: "requests.creditFacility",
        path: "/requests/credit-facility",
        icon: FaHandshake, // Icon for credit facility agreements
      },
      {
        id: 13,
        label: "requests.visa",
        path: "/requests/visa-card",
        icon: FaCreditCard, // Icon for Visa card requests
      },
      {
        id: 14,
        label: "requests.rtgs",
        path: "/rtgs",
        icon: FaReceipt, // Icon for RTGS transfer receipts
      },
      {
        id: 15,
        label: "requests.foreign",
        path: "/requests/foreign-transfers",
        icon: FaGlobe, // Represents foreign transfers
      },
      {
        id: 16,
        label: "requests.cbl",
        path: "/cbl",
        icon: FaClipboardList, // Icon for inquiry requests (CBL)
      },
    ],
  },
  {
    id: 17, // Divider
    label: "divider",
    path: "",
    icon: () => null,
    children: [],
  },
  {
    id: 18,
    label: "localization",
    path: "/localization",
    icon: HiOutlineCurrencyDollar, // Represents salary localization or money management
    children: [],
  },
  {
    id: 19,
    label: "documentary",
    path: "/documentary",
    icon: FaFileInvoice, // Icon for documentary credits
    children: [],
  },
  {
    id: 20,
    label: "followUp",
    path: "/follow-up",
    icon: FaTasks, // Icon for following up requests
    children: [],
  },
  {
    id: 21, // Divider before settings and logout
    label: "divider",
    path: "",
    icon: () => null,
    children: [],
  },
  {
    id: 22,
    label: "settings",
    path: "/settings",
    icon: FaCog, // Standard icon for settings
    children: [],
  },
  {
    id: 23,
    label: "changeLanguage",
    path: "/change-language", // A pseudo-path for the toggle
    icon: FaLanguage, // Icon for language change
    children: [],
    isLocaleToggle: true, // Custom property to identify this special action
  },
  {
    id: 24,
    label: "logout",
    path: "/logout",
    icon: FaSignOutAlt, // Standard logout icon
    children: [],
  },
];
