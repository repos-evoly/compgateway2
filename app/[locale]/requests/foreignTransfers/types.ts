// types.ts

/** 
 * The shape used for your form. 
 * "id?" if you might store an ID, or define it if it’s needed. 
 */
export type ForeignTransfersFormValues = {
  id?: number; // if you want to keep track of the row ID as well
  toBank?: string;
  branch?: string;
  residentSupplierName?: string;
  residentSupplierNationality?: string;
  nonResidentSupplierPassportNumber?: number;
  placeOfIssue?: string;
  dateOfIssue?: string;
  nonResidentSupplierNationality?: string;
  nonResidentAddress?: string;

  transferAmount?: number;
  toCountry?: string;
  beneficiaryName?: string;
  beneficiaryAddress?: string;
  externalBankName?: string;
  externalBankAddress?: string;
  transferToAccountNumber?: number;
  transferToAddress?: string;
  accountholderName?: string;
  permenantAddress?: string;
  purposeOfTransfer?: string;
};

/** The shape of the single detail response from /foreigntransfers/{id} */
export interface ForeignTransferDetailResponse {
  id: number;
  userId: number;
  toBank: string;
  branch: string;
  residentSupplierName: string;
  residentSupplierNationality: string;
  nonResidentPassportNumber: string;
  placeOfIssue: string;
  dateOfIssue: string;
  nonResidentNationality: string;
  nonResidentAddress: string;
  transferAmount: number;
  toCountry: string;
  beneficiaryName: string;
  beneficiaryAddress: string;
  externalBankName: string;
  externalBankAddress: string;
  transferToAccountNumber: string;
  transferToAddress: string;
  accountHolderName: string;
  permanentAddress: string;
  purposeOfTransfer: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/** The shape of the listing response from /foreigntransfers (with pagination) */
export interface ForeignTransfersListResponse {
  data: ForeignTransferDetailResponse[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}


/**
 * The payload for POST /foreigntransfers.
 * This is essentially the same shape as your form, minus 'id'.
 */
export interface CreateForeignTransferPayload {
  toBank: string;
  branch: string;
  residentSupplierName: string;
  residentSupplierNationality: string;
  nonResidentPassportNumber: string;
  placeOfIssue: string;
  dateOfIssue: string;
  nonResidentNationality: string;
  nonResidentAddress: string;
  transferAmount: number;
  toCountry: string;
  beneficiaryName: string;
  beneficiaryAddress: string;
  externalBankName: string;
  externalBankAddress: string;
  transferToAccountNumber: string;
  transferToAddress: string;
  accountHolderName: string;
  permanentAddress: string;
  purposeOfTransfer: string;
}