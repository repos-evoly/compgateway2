export type BeneficiaryType = "local" | "international" | "Individual";

export type LocalBeneficiary = {
  id?: number;
  type: "local";
  name: string;
  accountNumber: string;
  bank: string;
  amount: number;
  address: string;
  country: string;
};

export type InternationalBeneficiary = {
  id?: number;
  type: "international";
  name: string;
  address: string;
  country: string;
  accountNumber: string;
  intermediaryBankSwift: string;
  intermediaryBankName: string;
};

export type BeneficiaryFormValues = LocalBeneficiary | InternationalBeneficiary;

export type BeneficiaryFormProps = {
  initialData?: Partial<BeneficiaryFormValues>;
  onSubmit?: (values: BeneficiaryFormValues) => void;
  viewOnly?: boolean;
  onSuccess?: () => void;
  onBack?: () => void;
};

export type BeneficiaryPayload = BeneficiaryFormValues;

export type BeneficiaryResponse = {
  id: number;
  type: BeneficiaryType;
  name: string;
  accountNumber: string;
  address?: string;
  country?: string;
  bank?: string;
  amount?: number;
  intermediaryBankSwift?: string;
  intermediaryBankName?: string;
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
