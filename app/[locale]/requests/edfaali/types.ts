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

export type TEdfaaliListItem = {
  id: string;
  representativeId: string;
  representativeName?: string;
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
  accountNumber: string;
  createdAt?: string;
};

export type EdfaaliRequestApiItem = {
  id?: string | number | null;
  representativeId?: string | number | null;
  representativeName?: string | null;
  nationalId?: string | null;
  identificationNumber?: string | null;
  identificationType?: string | null;
  companyEnglishName?: string | null;
  workAddress?: string | null;
  storeAddress?: string | null;
  city?: string | null;
  area?: string | null;
  street?: string | null;
  mobileNumber?: string | null;
  servicePhoneNumber?: string | null;
  bankAnnouncementPhoneNumber?: string | null;
  email?: string | null;
  accountNumber?: string | null;
  createdAt?: string | null;
  [key: string]: unknown;
};

export type EdfaaliRequestsListApiResponse =
  | EdfaaliRequestApiItem[]
  | {
      data?: EdfaaliRequestApiItem[];
      page?: number;
      limit?: number;
      totalPages?: number;
      totalRecords?: number;
    };

export type EdfaaliRequestsList = {
  data: TEdfaaliListItem[];
  page?: number;
  limit?: number;
  totalPages?: number;
  totalRecords?: number;
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
  ) => void | Promise<void>;
  onBack?: () => void;
  readOnly?: boolean;
};
