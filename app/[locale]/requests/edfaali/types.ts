import type { FormikHelpers } from "formik";
import type { InputHTMLAttributes } from "react";

export const ACCOUNT_NUMBER_PREFIX = "0123" as const;
export const ACCOUNT_NUMBER_SUFFIX = "001" as const;
export const ACCOUNT_NUMBER_PATTERN = new RegExp(
  `^${ACCOUNT_NUMBER_PREFIX}-\\d{6}-${ACCOUNT_NUMBER_SUFFIX}$`
);

export type DocumentType =
  | "passport"
  | "birthStatement"
  | "activityLicense";

export type TEdfaaliDocument = {
  type: DocumentType;
  file: File | null;
};

export type TEdfaaliFormValues = {
  representativeId: string;
  nationalId: string;
  identificationNumber: string;
  identificationType: string;
  companyEnglishName: string;
  workAddress: string;
  storeAddress: string;
  city: string;
  area: string;
  street: string;
  mobileNumber: string;
  servicePhoneNumber: string;
  bankAnnouncementPhoneNumber: string;
  email: string;
  accountNumber: string; // stored as full string e.g. 0123-123456-001
  documents: TEdfaaliDocument[];
};

export type TEdfaaliListItem = TEdfaaliFormValues & {
  id: string;
  createdAt: string;
  representativeName: string;
};

type BaseFieldConfig = {
  name: keyof TEdfaaliFormValues;
  label: string;
  colSpan?: "full";
};

export type SelectFieldConfig = BaseFieldConfig & {
  component: "select";
  placeholder?: string;
  options: Array<{ label: string; value: string }>;
};

export type InputFieldConfig = BaseFieldConfig & {
  component: "input";
  type?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
};

export type AccountNumberFieldConfig = BaseFieldConfig & {
  component: "accountNumber";
  helperText?: string;
};

export type FieldConfig =
  | SelectFieldConfig
  | InputFieldConfig
  | AccountNumberFieldConfig;

export type SectionConfig = {
  key: string;
  title: string;
  description?: string;
  fields: FieldConfig[];
};

export type EdfaaliFormProps = {
  initialValues?: Partial<TEdfaaliFormValues>;
  onSubmit?: (
    values: TEdfaaliFormValues,
    helpers: FormikHelpers<TEdfaaliFormValues>
  ) => void;
  onBack?: () => void;
  readOnly?: boolean;
};
