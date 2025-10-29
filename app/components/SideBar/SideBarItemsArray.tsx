import {
  FaUsers, // employees
  FaUniversity,
  FaCheck,
  FaHandshake,
  FaMoneyCheckAlt,
  FaGlobe,
  FaCreditCard,
  FaReceipt,
  FaClipboardList,
  FaFileInvoice,
  FaExchangeAlt, // transfers (parent)
  FaCoins, // currencies
  FaSignOutAlt,
  // FaTasks,
  FaFileSignature,
  FaLanguage,
  FaUserCircle, // profile
  FaUserCog,
  FaRegAddressCard,
  FaUserTie,
} from "react-icons/fa";
// import { IoEarth } from "react-icons/io5";
import { MdRequestQuote } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";

// import { HiOutlineCurrencyDollar } from "react-icons/hi";
// import { BiDollarCircle, BiUpload, BiTransferAlt } from "react-icons/bi"; // New icons for Salary Localization children

export const sidebarItems = [
  {
    id: 31,
    label: "dashboard",
    path: "/dashboard",
    icon: RxDashboard, // was FaCog
    children: [],
    permissions: ["CompanyCanDashboard"],
  },
  {
    id: 0,
    label: "profile",
    path: "/profile",
    icon: FaUserCircle,
    children: [],
    permissions: [],
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
    id: 36, // Divider
    label: "divider",
    path: "",
    icon: () => null,
    children: [],
    // No permissions → always visible
  },
  {
    id: 37,
    label: "salaries",
    path: "/salaries",
    icon: FaMoneyCheckAlt, // was FaCog
    children: [],
    permissions: ["canCreateOrEditSalaryCycle"],
  },
  {
    id: 35,
    label: "users",
    path: "/users",
    icon: FaUserCog, // was FaCog
    children: [],
    permissions: ["CompanyCanEmployees"],
  },
  {
    id: 33,
    label: "employees",
    path: "/employees",
    icon: FaUsers, // was FaCog
    children: [],
    permissions: ["CompanyCanEmployees"],
  },
  {
    id: 32,
    label: "representatives",
    path: "/representatives",
    icon: FaUserTie,
    children: [],
    // No permissions → always visible (for testing)
    // permissions: ["CompanyCanRepresentatives"],
  },
  {
    id: 34,
    label: "beneficiaries",
    path: "/beneficiaries",
    icon: FaRegAddressCard,
    children: [],
    // No permissions → always visible (for testing)
    // permissions: ["CompanyCanBeneficiaries"],
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
    icon: FaExchangeAlt, // was IoWalletSharp
    enabledTransactionCategories: ["Transfers"],
    children: [
      {
        id: 4,
        label: "transfer.in",
        path: "/transfers/internal",
        icon: FaUniversity,
        enabledTransactionCategories: ["InternalTransfer"],
      },
      // {
      //   id: 5,
      //   label: "transfer.group",
      //   path: "/transfers/group-transfer",
      //   icon: FaUsers,
      //   enabledTransactionCategories: ["GroupTransfer"],
      // },
      // {
      //   id: 6,
      //   label: "transfer.out",
      //   path: "/transfer/external",
      //   icon: IoEarth,
      // },
    ],
  },
  {
    id: 7, // Divider
    label: "divider",
    path: "",
    icon: () => null,
    children: [],
    permissions: ["CompanyCanTransfer"],
    enabledTransactionCategories: ["Transfers"],
  },
  {
    id: 8,
    label: "requests.label",
    path: "/requests",
    icon: MdRequestQuote,
    permissions: ["CompanyCanRequests"],
    enabledTransactionCategories: ["Requests"],
    children: [
      {
        id: 9,
        label: "requests.checkBook",
        path: "/requests/checkbook",
        icon: FaMoneyCheckAlt,
        permissions: ["CompanyCanRequestCheckBook"],
        enabledTransactionCategories: ["Checkbook"],
      },
      {
        id: 10,
        label: "requests.certifiedCheck",
        path: "/requests/checkRequest",
        icon: FaCheck,
        permissions: ["CompanyCanRequestCertifiedCheck"],
        enabledTransactionCategories: ["CheckRequest"],
      },
      {
        id: 11,
        label: "requests.guaranteeLetter",
        path: "/requests/letterOfGuarantee",
        icon: FaFileSignature,
        permissions: ["CompanyCanRequestGuaranteeLetter"],
        enabledTransactionCategories: ["LetterOfGuarantee"],
      },
      {
        id: 12,
        label: "requests.creditFacility",
        path: "/requests/creditFacility",
        icon: FaHandshake,
        permissions: ["CompanyCanRequestCreditFacility"],
        enabledTransactionCategories: ["CreditFacility"],
      },
      {
        id: 13,
        label: "requests.visa",
        path: "/requests/visaRequest",
        icon: FaCreditCard,
        permissions: ["CompanyCanRequestVisa"],
        enabledTransactionCategories: ["VisaRequest"],
      },
      {
        id: 29,
        label: "requests.certifiedBankStatement",
        path: "/requests/certifiedBankStatement",
        icon: FaClipboardList,
        permissions: ["CompanyCanRequestCertifiedBankStatement"],
        enabledTransactionCategories: ["CertifiedBankStatement"],
      },
      {
        id: 14,
        label: "requests.rtgs",
        path: "/requests/rtgs",
        icon: FaReceipt,
        permissions: ["CompanyCanRequestRTGS"],
        enabledTransactionCategories: ["Rtgs"],
      },
      {
        id: 15,
        label: "requests.foreign",
        path: "/requests/foreignTransfers",
        icon: FaGlobe,
        permissions: ["CompanyCanRequestForeignTransfers"],
        enabledTransactionCategories: ["ForeignTransfer"],
      },
      {
        id: 16,
        label: "requests.cbl",
        path: "/requests/cbl",
        icon: FaClipboardList,
        permissions: ["CompanyCanRequestCBL"],
        enabledTransactionCategories: ["CBL"],
      },
      // {
      //   id: 38,
      //   label: "requests.edfaali",
      //   path: "/requests/edfaali",
      //   icon: FaFileInvoice,
      //   permissions: [],
      // },
    ],
  },
  {
    id: 17, // Divider
    label: "divider",
    path: "",
    icon: () => null,
    children: [],
    permissions: ["CompanyCanRequests"],
    enabledTransactionCategories: ["Requests"],
  },
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
    icon: FaCoins, // was FaCog
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
