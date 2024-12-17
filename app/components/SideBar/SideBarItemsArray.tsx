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
import { BiDollarCircle, BiUpload, BiTransferAlt } from "react-icons/bi"; // New icons for Salary Localization children

export const sidebarItems = [
  {
    id: 1,
    label: "statementOfAccount",
    path: "/statement-of-account",
    icon: FaFileInvoice,
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
    icon: IoWalletSharp,
    children: [
      {
        id: 4,
        label: "transfer.inBank",
        path: "/transfer/in-bank",
        icon: FaUniversity,
      },
      {
        id: 5,
        label: "transfer.betweenBanks",
        path: "/transfer/between-banks",
        icon: FaExchangeAlt,
      },
      {
        id: 6,
        label: "transfer.out",
        path: "/transfer/external",
        icon: IoEarth,
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
    icon: MdRequestQuote,
    children: [
      {
        id: 9,
        label: "requests.checkBook",
        path: "/checkbook",
        icon: FaMoneyCheckAlt,
      },
      {
        id: 10,
        label: "requests.certifiedCheck",
        path: "/checkRequest",
        icon: FaCheck,
      },
      {
        id: 11,
        label: "requests.guaranteeLetter",
        path: "/requests/guarantee-letter",
        icon: FaFileSignature,
      },
      {
        id: 12,
        label: "requests.creditFacility",
        path: "/requests/credit-facility",
        icon: FaHandshake,
      },
      {
        id: 13,
        label: "requests.visa",
        path: "/requests/visa-card",
        icon: FaCreditCard,
      },
      {
        id: 14,
        label: "requests.rtgs",
        path: "/rtgs",
        icon: FaReceipt,
      },
      {
        id: 15,
        label: "requests.foreign",
        path: "/requests/foreign-transfers",
        icon: FaGlobe,
      },
      {
        id: 16,
        label: "requests.cbl",
        path: "/cbl",
        icon: FaClipboardList,
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
    label: "salaryLocalization.title",
    path: "/localization",
    icon: HiOutlineCurrencyDollar,
    children: [
      {
        id: 25,
        label: "salaryLocalization.salaries",
        path: "/localization/salaries",
        icon: BiDollarCircle, // Icon representing salaries/money
      },
      {
        id: 26,
        label: "salaryLocalization.uploadFiles",
        path: "/localization/upload-files",
        icon: BiUpload, // Icon for file uploads
      },
      {
        id: 27,
        label: "salaryLocalization.salariesTransfer",
        path: "/localization/salaries-transfer",
        icon: BiTransferAlt, // Icon representing salary transfers
      },
    ],
  },
  {
    id: 19,
    label: "documentary",
    path: "/documentary",
    icon: FaFileInvoice,
    children: [],
  },
  {
    id: 20,
    label: "followUp",
    path: "/follow-up",
    icon: FaTasks,
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
    icon: FaCog,
    children: [],
  },
  {
    id: 23,
    label: "changeLanguage",
    path: "/change-language",
    icon: FaLanguage,
    children: [],
    isLocaleToggle: true,
  },
  {
    id: 24,
    label: "logout",
    path: "/logout",
    icon: FaSignOutAlt,
    children: [],
  },
];
