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
  // FaTasks,
  FaFileSignature,
  FaLanguage,
} from "react-icons/fa";
import { IoWalletSharp } from "react-icons/io5";
import { MdRequestQuote } from "react-icons/md";
// import { HiOutlineCurrencyDollar } from "react-icons/hi";
// import { BiDollarCircle, BiUpload, BiTransferAlt } from "react-icons/bi"; // New icons for Salary Localization children

export const sidebarItems = [
  {
    id: 31,
    label: "dashboard",
    path: "/dashboard",
    icon: FaCog,
    children: [],
    permissions: ["CompanyCanDashboard"],
  },
  {
    id: 1,
    label: "statementOfAccount",
    path: "/statement-of-account",
    icon: FaFileInvoice,
    children: [],
    permissions: ["CompanyCanStatementOfAccount"],
  },
  {
    id: 31,
    label: "employees",
    path: "/employees",
    icon: FaCog,
    children: [],
    permissions: ["CompanyCanEmployees"],
  },
  {
    id: 2, // Divider
    label: "divider",
    path: "",
    icon: () => null,
    children: [],
    // No permissions → always visible
  },
  {
    id: 3,
    label: "transfer.label",
    path: "/transfer",
    icon: IoWalletSharp,
    permissions: ["CompanyCanTransfer"],
    children: [
      {
        id: 4,
        label: "transfer.in",
        path: "/transfers/internal",
        icon: FaUniversity,
        permissions: ["CompanyCanTransferInternal"],
      },

      // {
      //   id: 6,
      //   label: "transfer.out",
      //   path: "/transfer/external",
      //   icon: IoEarth,
      //   permissions: ["CompanyCanTransferExternal"],
      // },
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
    permissions: ["CompanyCanRequests"],
    children: [
      {
        id: 9,
        label: "requests.checkBook",
        path: "/requests/checkbook",
        icon: FaMoneyCheckAlt,
        permissions: ["CompanyCanRequestCheckBook"],
      },
      {
        id: 10,
        label: "requests.certifiedCheck",
        path: "/requests/checkRequest",
        icon: FaCheck,
        permissions: ["CompanyCanRequestCertifiedCheck"],
      },
      {
        id: 11,
        label: "requests.guaranteeLetter",
        path: "/requests/letterOfGuarantee",
        icon: FaFileSignature,
        permissions: ["CompanyCanRequestGuaranteeLetter"],
      },
      {
        id: 12,
        label: "requests.creditFacility",
        path: "/requests/creditFacility",
        icon: FaHandshake,
        permissions: ["CompanyCanRequestCreditFacility"],
      },
      {
        id: 13,
        label: "requests.visa",
        path: "/requests/visaRequest",
        icon: FaCreditCard,
        permissions: ["CompanyCanRequestVisa"],
      },
      {
        id: 29,
        label: "requests.certifiedBankStatement",
        path: "/requests/certifiedBankStatement",
        icon: FaClipboardList,
        permissions: ["CompanyCanRequestCertifiedBankStatement"],
      },
      {
        id: 14,
        label: "requests.rtgs",
        path: "/requests/rtgs",
        icon: FaReceipt,
        permissions: ["CompanyCanRequestRTGS"],
      },
      {
        id: 15,
        label: "requests.foreign",
        path: "/requests/foreignTransfers",
        icon: FaGlobe,
        permissions: ["CompanyCanRequestForeignTransfers"],
      },
      {
        id: 16,
        label: "requests.cbl",
        path: "/requests/cbl",
        icon: FaClipboardList,
        permissions: ["CompanyCanRequestCBL"],
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
  // {
  //   id: 18,
  //   label: "salaryLocalization.title",
  //   path: "/localization",
  //   icon: HiOutlineCurrencyDollar,
  //   permissions: ["CompanyCanSalaryLocalization"],
  //   children: [
  //     {
  //       id: 25,
  //       label: "salaryLocalization.salaries",
  //       path: "/salaries",
  //       icon: BiDollarCircle, // Icon representing salaries/money
  //       permissions: ["CompanyCanSalaryLocalizationSalaries"],
  //     },
  //     {
  //       id: 26,
  //       label: "salaryLocalization.uploadFiles",
  //       path: "/salaries/upload-files",
  //       icon: BiUpload, // Icon for file uploads
  //       permissions: ["CompanyCanSalaryLocalizationUploadFiles"],
  //     },
  //     {
  //       id: 27,
  //       label: "salaryLocalization.salariesTransfer",
  //       path: "/localization/salaries-transfer",
  //       icon: BiTransferAlt, // Icon representing salary transfers
  //       permissions: ["CompanyCanSalaryLocalizationTransfer"],
  //     },
  //   ],
  // },
  // {
  //   id: 19,
  //   label: "documentary",
  //   path: "/documentary",
  //   icon: FaFileInvoice,
  //   permissions: ["CompanyCanDocumentary"],
  //   children: [],
  // },
  // {
  //   id: 20,
  //   label: "followUp",
  //   path: "/follow-up",
  //   icon: FaTasks,
  //   permissions: ["CompanyCanFollowUp"],
  //   children: [],
  // },
  // {
  //   id: 21, // Divider before settings and logout
  //   label: "divider",
  //   path: "",
  //   icon: () => null,
  //   children: [],
  // },
  // {
  //   id: 22,
  //   label: "customizations",
  //   path: "/customizations",
  //   icon: FaCog,
  //   permissions: ["CompanyCanCustomizations"],
  //   children: [],
  // },
  // {
  //   id: 22,
  //   label: "customizations.label",
  //   path: "",
  //   icon: HiOutlineCurrencyDollar,
  //   permissions: ["CompanyCanCustomizations"],
  //   children: [
  //     {
  //       id: 26,
  //       label: "customizations.banks",
  //       path: "/customizations/banks",
  //       icon: BiDollarCircle, // Icon representing salaries/money
  //       permissions: ["CompanyCanCustomizationsBanks"],
  //     },
  //     {
  //       id: 27,
  //       label: "customizations.commissions",
  //       path: "/customizations/commissions",
  //       icon: BiUpload, // Icon for file uploads
  //       permissions: ["CompanyCanCustomizationsCommissions"],
  //     },
  //     {
  //       id: 28,
  //       label: "customizations.limits",
  //       path: "/customizations/limits",
  //       icon: BiTransferAlt, // Icon representing salary transfers
  //       permissions: ["CompanyCanCustomizationsLimits"],
  //     },
  //   ],
  // },
  {
    id: 30,
    label: "currencies",
    path: "/currencies",
    icon: FaCog,
    children: [],
    permissions: ["CompanyCanCurrencies"],
  },
  // {
  //   id: 23,
  //   label: "settings",
  //   path: "/settings",
  //   icon: FaCog,
  //   children: [],
  //   permissions: ["CompanyCanSettings"],
  // },
  {
    id: 24,
    label: "changeLanguage",
    path: "/change-language",
    icon: FaLanguage,
    children: [],
    isLocaleToggle: true,
    permissions: [], // always visible
  },
  {
    id: 25,
    label: "logout",
    path: "",
    icon: FaSignOutAlt,
    children: [],
    permissions: [], // always visible
  },
];
