/* --------------------------------------------------------------------------
   app/[locale]/requests/cbl/data.ts
   – Field order updated so currentAccount is first
   – No interfaces; using `type`
   -------------------------------------------------------------------------- */
import * as Yup from "yup";
import React from "react";
import {
  FaUser,
  FaDollarSign,
  FaBuilding,
  FaFileAlt,
  FaIdBadge,
} from "react-icons/fa";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import { Attachment } from "./types";

/* ------------------------------------------------------------------ */
/* Initial values                                                     */
/* ------------------------------------------------------------------ */

export const initialValues = {
  currentAccount: "", // moved to top
  partyName: "",
  capital: 0,
  foundingDate: new Date(),
  legalForm: "",
  branchOrAgency: "",
  accountOpening: new Date(),
  commercialLicense: "",
  validatyLicense: new Date(),
  commercialRegistration: "",
  validatyRegister: new Date(),
  statisticalCode: "",
  validatyCode: new Date(),
  chamberNumber: "",
  validatyChamber: new Date(),
  taxNumber: "",
  office: "",
  legalRepresentative: "",
  representativeNumber: "",
  birthDate: new Date(),
  passportNumber: "",
  passportIssuance: new Date(),
  passportExpiry: new Date(),
  mobile: "",
  address: "",
  table1Data: [{ name: "", position: "" }],
  table2Data: [{ name: "", signature: "" }],
  packingDate: new Date(),
  specialistName: "",
};

/* ------------------------------------------------------------------ */
/* Validation schema                                                  */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------
   Validation schema  – now includes `files` and `newFiles`
   ------------------------------------------------------------------ */
export const validationSchema = (t: (key: string) => string) =>
  Yup.object({
    id: Yup.number()
      .typeError("ID must be a number")
      .required("ID is required"),

    /* ───────── business fields (unchanged) ───────── */
    currentAccount: Yup.string().required("Current account is required"),
    partyName: Yup.string().required("Party name is required"),
    capital: Yup.number().required("Capital is required"),
    foundingDate: Yup.date().required("Founding date is required"),
    legalForm: Yup.string().required("Legal form is required"),
    branchOrAgency: Yup.string().required("Branch or agency is required"),
    accountOpening: Yup.date().required("Account opening date is required"),
    commercialLicense: Yup.string().required("Commercial license is required"),
    validatyLicense: Yup.date().required("License validity date is required"),
    commercialRegistration: Yup.string().required(
      "Commercial registration is required"
    ),
    validatyRegister: Yup.date().required(
      "Registration validity date is required"
    ),
    statisticalCode: Yup.string().required("Statistical code is required"),
    validatyCode: Yup.date().required(
      "Statistical code validity date is required"
    ),
    chamberNumber: Yup.string().required("Chamber number is required"),
    validatyChamber: Yup.date().required("Chamber validity date is required"),
    taxNumber: Yup.string().required("Tax number is required"),
    office: Yup.string().required("Office is required"),
    legalRepresentative: Yup.string().required(
      "Legal representative name is required"
    ),
    representativeNumber: Yup.string().required(
      "Representative number is required"
    ),
    birthDate: Yup.date().required("Birth date is required"),
    passportNumber: Yup.string()
      .required(t("passportNumber") + " " + t("isRequired"))
      .matches(/^\d{8,}$/, t("passportNumber") + " must be at least 8 digits"),
    passportIssuance: Yup.date().required("Passport issuance date is required"),
    passportExpiry: Yup.date().required("Passport expiry date is required"),
    address: Yup.string().required("Address is required"),
    mobile: Yup.string()
      .required(t("mobile") + " " + t("isRequired"))
      .test("len", t("mobile") + " must be exactly 10 digits", (val) =>
        val ? val.length === 10 : false
      ),
    table1Data: Yup.array()
      .of(
        Yup.object({
          name: Yup.string().required("Name is required"),
          position: Yup.string().required("Position is required"),
        })
      )
      .required("Table 1 data is required"),
    table2Data: Yup.array()
      .of(
        Yup.object({
          name: Yup.string().required("Name is required"),
          signature: Yup.string().required("Signature is required"),
        })
      )
      .required("Table 2 data is required"),
    packingDate: Yup.date().required("Packing date is required"),
    specialistName: Yup.string().required("Specialist name is required"),

    /* ───────── FILE ARRAYS (new) ───────── */
    /* 1. existing attachments */
    /* attachment arrays */
    files: Yup.array()
      .of(Yup.mixed<File>().defined())
      .min(1, t("atLeastOneFile"))
      .max(9, t("maxFiles"))
      .defined(), //  ←—  not undefined any more

    newFiles: Yup.array()
      .of(Yup.mixed<File>().defined())
      .max(9, t("maxFiles"))
      .defined(), //  ←—  same here

    status: Yup.string().optional(),
    attachmentUrls: Yup.array().of(Yup.string().url().required()).optional(),
    /* ---------- THE MISSING ONE ---------- */
    attachments: Yup.array<Attachment>().defined(),
  });

/* ------------------------------------------------------------------ */
/* Column helpers                                                     */
/* ------------------------------------------------------------------ */
export const getColumns = (t: (key: string) => string) => ({
  table1: [t("table1.columns.name"), t("table1.columns.position")],
  table2: [t("table2.columns.name"), t("table2.columns.signature")],
});

/* ------------------------------------------------------------------ */
/* Field metadata (currentAccount is first)                           */
/* ------------------------------------------------------------------ */
export const fields = (t: (key: string) => string) => [
  {
    name: "currentAccount",
    label: t("currentAccount"),
    component: FormInputIcon,
    type: "text",
    icon: <FaBuilding />,
  },
  {
    name: "partyName",
    label: t("partyName"),
    component: FormInputIcon,
    type: "text",
    icon: <FaUser />,
  },
  {
    name: "capital",
    label: t("capital"),
    component: FormInputIcon,
    type: "number",
    icon: <FaDollarSign />,
  },
  {
    name: "foundingDate",
    label: t("foundingDate"),
    component: DatePickerValue,
    type: "date",
  },
  {
    name: "legalForm",
    label: t("legalForm"),
    component: FormInputIcon,
    type: "text",
    icon: <FaFileAlt />,
  },
  {
    name: "branchOrAgency",
    label: t("branchOrAgency"),
    component: FormInputIcon,
    type: "text",
    icon: <FaBuilding />,
  },
  {
    name: "accountOpening",
    label: t("accountOpening"),
    component: DatePickerValue,
    type: "date",
  },
  {
    name: "commercialLicense",
    label: t("commercialLicense"),
    component: FormInputIcon,
    type: "text",
    icon: <FaFileAlt />,
  },
  {
    name: "validatyLicense",
    label: t("validatyLicense"),
    component: DatePickerValue,
    type: "date",
  },
  {
    name: "commercialRegistration",
    label: t("commercialRegistration"),
    component: FormInputIcon,
    type: "text",
    icon: <FaIdBadge />,
  },
  {
    name: "validatyRegister",
    label: t("validatyRegister"),
    component: DatePickerValue,
    type: "date",
  },
  {
    name: "statisticalCode",
    label: t("statisticalCode"),
    component: FormInputIcon,
    type: "text",
    icon: <FaFileAlt />,
  },
  {
    name: "validatyCode",
    label: t("validatyCode"),
    component: DatePickerValue,
    type: "date",
  },
  {
    name: "chamberNumber",
    label: t("chamberNumber"),
    component: FormInputIcon,
    type: "text",
    icon: <FaBuilding />,
  },
  {
    name: "validatyChamber",
    label: t("validatyChamber"),
    component: DatePickerValue,
    type: "date",
  },
  {
    name: "taxNumber",
    label: t("taxNumber"),
    component: FormInputIcon,
    type: "text",
    icon: <FaFileAlt />,
  },
  {
    name: "office",
    label: t("office"),
    component: FormInputIcon,
    type: "text",
    icon: <FaBuilding />,
  },
  {
    name: "legalRepresentative",
    label: t("legalRepresentative"),
    component: FormInputIcon,
    type: "text",
    icon: <FaUser />,
  },
  {
    name: "representativeNumber",
    label: t("representativeNumber"),
    component: FormInputIcon,
    type: "text",
    icon: <FaIdBadge />,
  },
  {
    name: "birthDate",
    label: t("birthDate"),
    component: DatePickerValue,
    type: "date",
  },
  {
    name: "passportNumber",
    label: t("passportNumbers"),
    component: FormInputIcon,
    type: "number",
    icon: <FaIdBadge />,
  },
  {
    name: "passportIssuance",
    label: t("passportIssuance"),
    component: DatePickerValue,
    type: "date",
  },
  {
    name: "passportExpiry",
    label: t("passportExpiry"),
    component: DatePickerValue,
    type: "date",
  },
  {
    name: "mobile",
    label: t("mobile"),
    component: FormInputIcon,
    type: "text",
    icon: <FaFileAlt />,
  },
  {
    name: "address",
    label: t("address"),
    component: FormInputIcon,
    type: "text",
    icon: <FaBuilding />,
  },
  {
    name: "packingDate",
    label: t("packingDate"),
    component: DatePickerValue,
    type: "date",
  },
  // specialistName is rendered separately
];
