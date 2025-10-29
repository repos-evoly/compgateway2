import * as Yup from "yup";

import {
  ACCOUNT_NUMBER_PATTERN,
  ACCOUNT_NUMBER_PREFIX,
  ACCOUNT_NUMBER_SUFFIX,
  DocumentType,
  SectionConfig,
  TEdfaaliFormValues,
} from "./types";

export type TranslateFn = (key: string, vars?: Record<string, string>) => string;

export const documentUploadDefinitions: Array<{
  type: DocumentType;
  labelKey: string;
  accept: string;
}> = [
  {
    type: "passport",
    labelKey: "documents.passport",
    accept: "image/*",
  },
  {
    type: "birthStatement",
    labelKey: "documents.birthStatement",
    accept: "image/*",
  },
  {
    type: "activityLicense",
    labelKey: "documents.activityLicense",
    accept: "image/*",
  },
];

export const initialValues: TEdfaaliFormValues = {
  representativeId: "",
  nationalId: "",
  identificationNumber: "",
  identificationType: "",
  companyEnglishName: "",
  workAddress: "",
  storeAddress: "",
  city: "",
  area: "",
  street: "",
  mobileNumber: "",
  servicePhoneNumber: "",
  bankAnnouncementPhoneNumber: "",
  email: "",
  accountNumber: "",
  documents: documentUploadDefinitions.map(({ type }) => ({
    type,
    file: null,
  })),
};

export const identificationTypeOptions = [
  { value: "nationalId", labelKey: "identificationTypes.nationalId" },
  { value: "passport", labelKey: "identificationTypes.passport" },
  { value: "commercialLicense", labelKey: "identificationTypes.commercialLicense" },
];

export const representativePlaceholderOptions = [
  { value: "rep-1", labelKey: "representatives.sampleOne" },
  { value: "rep-2", labelKey: "representatives.sampleTwo" },
  { value: "rep-3", labelKey: "representatives.sampleThree" },
];

export const composedAccountNumber = (middleDigits: string): string =>
  `${ACCOUNT_NUMBER_PREFIX}-${middleDigits}-${ACCOUNT_NUMBER_SUFFIX}`;

export const pluckMiddleDigits = (fullAccount: string): string => {
  const match = fullAccount.match(
    new RegExp(
      `^${ACCOUNT_NUMBER_PREFIX}-(?<middle>\\d{0,6})-${ACCOUNT_NUMBER_SUFFIX}$`
    )
  );
  return match?.groups?.middle ?? "";
};

export const validationSchema = (t: TranslateFn) =>
  Yup.object<TEdfaaliFormValues>({
    representativeId: Yup.string().required(
      t("fieldRequired", { field: t("representative") })
    ),
    nationalId: Yup.string()
      .trim()
      .required(t("fieldRequired", { field: t("nationalId") }))
      .matches(/^[0-9]{6,20}$/u, t("numericOnly")),
    identificationNumber: Yup.string()
      .trim()
      .required(t("fieldRequired", { field: t("identificationNumber") })),
    identificationType: Yup.string().required(
      t("fieldRequired", { field: t("identificationType") })
    ),
    companyEnglishName: Yup.string().required(
      t("fieldRequired", { field: t("companyEnglishName") })
    ),
    workAddress: Yup.string().required(
      t("fieldRequired", { field: t("workAddress") })
    ),
    storeAddress: Yup.string().required(
      t("fieldRequired", { field: t("storeAddress") })
    ),
    city: Yup.string().required(t("fieldRequired", { field: t("city") })),
    area: Yup.string().required(t("fieldRequired", { field: t("area") })),
    street: Yup.string().required(t("fieldRequired", { field: t("street") })),
    mobileNumber: Yup.string()
      .trim()
      .required(t("fieldRequired", { field: t("mobileNumber") }))
      .matches(/^[0-9+\s-]{7,20}$/u, t("phoneFormat")),
    servicePhoneNumber: Yup.string()
      .trim()
      .required(t("fieldRequired", { field: t("servicePhoneNumber") }))
      .matches(/^[0-9+\s-]{7,20}$/u, t("phoneFormat")),
    bankAnnouncementPhoneNumber: Yup.string()
      .trim()
      .required(
        t("fieldRequired", { field: t("bankAnnouncementPhoneNumber") })
      )
      .matches(/^[0-9+\s-]{7,20}$/u, t("phoneFormat")),
    email: Yup.string()
      .trim()
      .email(t("invalidEmail"))
      .required(t("fieldRequired", { field: t("email") })),
    accountNumber: Yup.string()
      .required(t("fieldRequired", { field: t("accountNumber") }))
      .matches(ACCOUNT_NUMBER_PATTERN, t("accountNumberInvalid")),
    documents: Yup.array()
      .of(
        Yup.object({
          type: Yup.string().required(),
          file: Yup.mixed<File>().nullable(),
        })
      )
      .required()
      .min(documentUploadDefinitions.length)
      .max(documentUploadDefinitions.length),
  });

type BuildSectionsParams = {
  t: TranslateFn;
  representativeOptions: Array<{ label: string; value: string }>;
  idTypeOptions: Array<{ label: string; value: string }>;
};

export const buildSectionConfigs = ({
  t,
  representativeOptions,
  idTypeOptions,
}: BuildSectionsParams): SectionConfig[] => [
  {
    key: "generalInfo",
    title: t("sections.generalInfo"),
    description: t("sections.generalInfoDescription"),
    fields: [
      {
        name: "representativeId",
        label: t("representative"),
        component: "select",
        placeholder: t("selectRepresentative"),
        options: representativeOptions,
      },
      {
        name: "nationalId",
        label: t("nationalId"),
        component: "input",
        type: "text",
        inputMode: "numeric",
      },
      {
        name: "identificationNumber",
        label: t("identificationNumber"),
        component: "input",
        type: "text",
      },
      {
        name: "identificationType",
        label: t("identificationType"),
        component: "select",
        placeholder: t("selectIdentificationType"),
        options: idTypeOptions,
        colSpan: "full",
      },
    ],
  },
  {
    key: "addresses",
    title: t("sections.addresses"),
    description: t("sections.addressesDescription"),
    fields: [
      {
        name: "companyEnglishName",
        label: t("companyEnglishName"),
        component: "input",
        type: "text",
      },
      {
        name: "workAddress",
        label: t("workAddress"),
        component: "input",
        type: "text",
      },
      {
        name: "storeAddress",
        label: t("storeAddress"),
        component: "input",
        type: "text",
      },
      {
        name: "city",
        label: t("city"),
        component: "input",
        type: "text",
      },
      {
        name: "area",
        label: t("area"),
        component: "input",
        type: "text",
      },
      {
        name: "street",
        label: t("street"),
        component: "input",
        type: "text",
        colSpan: "full",
      },
    ],
  },
  {
    key: "contact",
    title: t("sections.contact"),
    description: t("sections.contactDescription"),
    fields: [
      {
        name: "mobileNumber",
        label: t("mobileNumber"),
        component: "input",
        type: "tel",
      },
      {
        name: "servicePhoneNumber",
        label: t("servicePhoneNumber"),
        component: "input",
        type: "tel",
      },
      {
        name: "bankAnnouncementPhoneNumber",
        label: t("bankAnnouncementPhoneNumber"),
        component: "input",
        type: "tel",
      },
      {
        name: "email",
        label: t("email"),
        component: "input",
        type: "email",
      },
    ],
  },
  {
    key: "account",
    title: t("sections.account"),
    description: t("sections.accountDescription"),
    fields: [
      {
        name: "accountNumber",
        label: t("accountNumber"),
        component: "accountNumber",
        helperText: t("accountNumberHelper"),
        colSpan: "full",
      },
    ],
  },
];
