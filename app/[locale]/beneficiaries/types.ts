export type BeneficiaryType = "local" | "international" | "Individual";

export const BENEFICIARY_PAYMENT_RAILS = [
  "normal",
  "onePay",
  "lyPay",
] as const;

export type BeneficiaryPaymentRail =
  (typeof BENEFICIARY_PAYMENT_RAILS)[number];

export type BeneficiarySearchField = "name" | "accountNumber" | "bank";

export type BeneficiaryFormValues = {
  id?: number;
  type: "local" | "international";
  paymentRail: BeneficiaryPaymentRail;
  name: string;
  accountNumber: string;
  address?: string;
  country?: string;
  bank?: string;
  amount?: number;
  intermediaryBankSwift?: string;
  intermediaryBankName?: string;
  institutionId?: string;
  providerInstitutionReference?: string;
  institutionName?: string;
  language?: "ar" | "en";
  rowVersion?: string;
};

export type BeneficiaryFormProps = {
  initialData?: Partial<BeneficiaryFormValues>;
  onSubmit?: (values: BeneficiaryFormValues) => void;
  viewOnly?: boolean;
  canManageProviderRails?: boolean;
  onSuccess?: () => void;
  onBack?: () => void;
};

export type BeneficiaryPayload = BeneficiaryFormValues;

export type BeneficiaryResponse = {
  id: number;
  type: BeneficiaryType;
  paymentRail?: BeneficiaryPaymentRail;
  name: string;
  accountNumber: string;
  address?: string;
  country?: string;
  bank?: string;
  amount?: number;
  intermediaryBankSwift?: string;
  intermediaryBankName?: string;
  institutionId?: string;
  providerInstitutionReference?: string;
  institutionName?: string;
  rowVersion?: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface BeneficiariesApiResponse {
  data: BeneficiaryResponse[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}
