export const LY_PAY_STATUSES = [
  "pendingApproval",
  "pendingProviderResponse",
  "completed",
  "failed",
  "unknown",
] as const;

export type LyPayStatus = (typeof LY_PAY_STATUSES)[number];

export type LyPayAccount = {
  accountNumber: string;
  accountName: string;
  currency: string;
  availableBalance: number;
};

export type LyPayInstitution = {
  institutionId: string;
  reference: string;
  shortName: string;
  fullName: string;
};

export type LyPayDeviceInfo = {
  deviceLat?: string;
  deviceLon?: string;
};

export type ValidateLyPayTransferPayload = {
  beneficiaryId?: number;
  fromAccount: string;
  toInstitutionId: string;
  toAccount: string;
  amount: number;
  description: string;
  language: "ar" | "en";
  deviceInfo?: LyPayDeviceInfo;
};

export type LyPayValidationResponse = {
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

export type CreateLyPayTransferPayload = {
  validationToken: string;
};

export type LyPayTransfer = {
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
  status: LyPayStatus;
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

export type LyPayTransfersResponse = {
  data: LyPayTransfer[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
};

export type LyPayFormValues = {
  beneficiaryId: string;
  fromAccount: string;
  toInstitutionId: string;
  toAccount: string;
  amount: number | "";
  description: string;
};
