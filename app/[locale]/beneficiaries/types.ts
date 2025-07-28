export type BeneficiaryType = "local" | "international";

export type LocalBeneficiary = {
  id?: number;
  type: "local";
  name: string;
  accountNumber: string;
  bank: string;
  amount: number;
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
};

export type BeneficiaryPayload = BeneficiaryFormValues;

export type BeneficiaryResponse = BeneficiaryFormValues & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

export interface BeneficiariesApiResponse {
  data: BeneficiaryResponse[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

