import {
  FaHome,
  FaCog,
  FaSignOutAlt,
  FaDollarSign,
  FaExchangeAlt,
  FaBook,
  FaCreditCard,
  FaClipboardList,
  FaMoneyBillWave,
  FaArrowAltCircleDown,
} from "react-icons/fa";
import { IoLanguage } from "react-icons/io5";

export const sidebarItems = [
  {
    id: 1,
    label: "statementOfAccount",
    path: "/statement-of-account",
    icon: FaHome,
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
    icon: FaExchangeAlt,
    children: [
      {
        id: 4,
        label: "transfer.inBank",
        path: "/transfer/in-bank",
        icon: FaMoneyBillWave,
      },
      {
        id: 5,
        label: "transfer.betweenBanks",
        path: "/transfer/between-banks",
        icon: FaDollarSign,
      },
      {
        id: 6,
        label: "transfer.out",
        path: "/transfer/external",
        icon: FaArrowAltCircleDown,
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
    icon: FaClipboardList,
    children: [
      {
        id: 9,
        label: "requests.checkBook",
        path: "/checkbook",
        icon: FaBook,
      },
      {
        id: 10,
        label: "requests.certifiedCheck",
        path: "/checkRequest",
        icon: FaCreditCard,
      },
      {
        id: 11,
        label: "requests.guaranteeLetter",
        path: "/requests/guarantee-letter",
        icon: FaCog,
      },
      {
        id: 12,
        label: "requests.creditFacility",
        path: "/requests/credit-facility",
        icon: FaDollarSign,
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
        icon: FaCog,
      },
      {
        id: 15,
        label: "requests.foreign",
        path: "/requests/foreign-transfers",
        icon: FaExchangeAlt,
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
    label: "localization",
    path: "/localization",
    icon: FaCog,
    children: [],
  },
  {
    id: 19,
    label: "documentary",
    path: "/documentary",
    icon: FaBook,
    children: [],
  },
  {
    id: 20,
    label: "followUp",
    path: "/follow-up",
    icon: FaClipboardList,
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
    path: "/change-language", // A pseudo-path for the toggle
    icon: IoLanguage,
    children: [],
    isLocaleToggle: true, // Custom property to identify this special action
  },
  {
    id: 24,
    label: "logout",
    path: "/logout",
    icon: FaSignOutAlt,
    children: [],
  },
];
