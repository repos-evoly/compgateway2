export type ForeignTransfersFormValues = {
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
  
  }