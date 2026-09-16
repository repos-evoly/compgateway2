export type MobileDevice = {
  deviceId: string;
  installationId: string;
  targetAuthUserId: number;
  platform: string;
  appVersion?: string | null;
  status: string;
  publicKeyFingerprint: string;
  attestationStatus?: string | null;
  createdAt: string;
  proofVerifiedAt?: string | null;
  approvedAt?: string | null;
  revokedAt?: string | null;
  lastSeenAt?: string | null;
};

export type MobileDevicePage = {
  data: MobileDevice[];
  page: number;
  limit: number;
  totalRecords: number;
};

export type CreateActivationCodeRequest = {
  targetAuthUserId: number;
  login: string;
  expiresInMinutes: number;
};

export type ActivationCodeResult = {
  activationId: string;
  activationCode: string;
  targetAuthUserId: number;
  expiresAt: string;
};
