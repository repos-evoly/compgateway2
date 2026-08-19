export const ONE_PAY_STATUSES = [
  "pendingApproval",
  "pendingProviderResponse",
  "completed",
  "failed",
  "unknown",
] as const;

export type OnePayStatus = (typeof ONE_PAY_STATUSES)[number];

export type OnePayAccount = {
  accountNumber: string;
  accountName: string;
  currency: string;
  availableBalance: number;
};

export type OnePayInstitution = {
  institutionId: string;
  reference: string;
  shortName: string;
  fullName: string;
};

export type OnePayDeviceInfo = {
  deviceLat?: string;
  deviceLon?: string;
};

export type ValidateOnePayTransferPayload = {
  beneficiaryId?: number;
  fromAccount: string;
  toInstitutionId: string;
  toAccount: string;
  amount: number;
  description: string;
  language: "ar" | "en";
  deviceInfo?: OnePayDeviceInfo;
};

export type OnePayValidationResponse = {
  validationToken: string;
  expiresAt: string;
  toAccountName: string;
  institutionName: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  description: string;
};

export type CreateOnePayTransferPayload = {
  validationToken: string;
};

export type OnePayTransfer = {
  [key: string]: string | number | boolean | null | object;
  id: number;
  referenceNo: string;
  fromAccount: string;
  fromAccountName: string;
  toInstitutionId: string;
  toInstitutionName: string;
  toAccount: string;
  toAccountName: string;
  amount: number;
  currency: string;
  description: string;
  status: OnePayStatus;
  createdByName: string;
  approvedByName: string | null;
  createdAt: string;
  validatedAt: string | null;
  executedAt: string | null;
  completedAt: string | null;
  statusCheckAttempts: number;
  lastStatusCheckedAt: string | null;
  providerTransactionStatus: string | null;
  providerReturnMessageCode: string | null;
  providerReturnMessage: string | null;
  bankReferenceNo: string | null;
  canApprove: boolean;
};

export type OnePayTransfersResponse = {
  data: OnePayTransfer[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
};

export type OnePayFormValues = {
  beneficiaryId: string;
  fromAccount: string;
  toInstitutionId: string;
  toAccount: string;
  amount: number | "";
  description: string;
};
