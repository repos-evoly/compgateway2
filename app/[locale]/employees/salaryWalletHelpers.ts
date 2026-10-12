import type { EmployeeResponse } from "./types";

export type WalletRecipientType = "evoId" | "phoneNumber";
export type SalaryPaymentChannel =
  | "bankAccount"
  | "evoWallet"
  | "bcdWallet";

export type SalaryAllocationDraft = {
  paymentChannel: SalaryPaymentChannel;
  amount: number;
};

export type AllocationAmounts = {
  bankAccount: number;
  evoWallet: number;
  bcdWallet: number;
};

export type AllocationValidationReason =
  | "salaryRequired"
  | "destinationRequired"
  | "allocationRequired"
  | "destinationUnavailable"
  | "railUnavailable"
  | "bcdUnavailable"
  | "totalMismatch";

export type AllocationValidation = {
  valid: boolean;
  reason?: AllocationValidationReason;
  channel?: SalaryPaymentChannel;
};

export const roundSalaryAmount = (value: unknown): number => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.replace(/,/g, "").trim())
        : 0;

  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 1000) / 1000;
};

export const normalizeDestination = (value?: string | null): string =>
  value?.trim() ?? "";

/**
 * Convert a Libyan mobile number into the canonical format expected by the
 * wallet providers. Separators are accepted for a friendlier employee form,
 * but the value stored in the rail destination is always +2189XXXXXXXX.
 */
export const normalizeLibyanWalletPhone = (
  value?: string | null
): string | null => {
  const raw = normalizeDestination(value);
  if (!raw || /[^0-9+\s().-]/.test(raw)) return null;

  let compact = raw.replace(/[\s().-]/g, "");

  if (compact.startsWith("00")) {
    compact = `+${compact.slice(2)}`;
  } else if (!compact.startsWith("+") && compact.startsWith("218")) {
    compact = `+${compact}`;
  } else if (/^0?9\d{8}$/.test(compact)) {
    const localNumber = compact.startsWith("0")
      ? compact.slice(1)
      : compact;
    compact = `+218${localNumber}`;
  }

  return /^\+2189\d{8}$/.test(compact) ? compact : null;
};

export const employeeHasDestination = (
  employee: Pick<
    EmployeeResponse,
    "accountNumber" | "evoWallet" | "bcdWallet"
  >,
  channel: SalaryPaymentChannel
): boolean => {
  if (channel === "bankAccount") {
    return normalizeDestination(employee.accountNumber).length > 0;
  }
  if (channel === "evoWallet") {
    return normalizeDestination(employee.evoWallet).length > 0;
  }
  return normalizeDestination(employee.bcdWallet).length > 0;
};

export const allocationTotal = (amounts: AllocationAmounts): number =>
  roundSalaryAmount(
    roundSalaryAmount(amounts.bankAccount) +
      roundSalaryAmount(amounts.evoWallet) +
      roundSalaryAmount(amounts.bcdWallet)
  );

export const validateEmployeeAllocations = (
  employee: EmployeeResponse,
  amounts: AllocationAmounts,
  availability: { evoEnabled: boolean; bcdEnabled: boolean }
): AllocationValidation => {
  const salary = roundSalaryAmount(employee.salary);
  if (salary <= 0) return { valid: false, reason: "salaryRequired" };

  const channels: SalaryPaymentChannel[] = [
    "bankAccount",
    "evoWallet",
    "bcdWallet",
  ];
  const positiveChannels = channels.filter(
    (channel) => roundSalaryAmount(amounts[channel]) > 0
  );

  if (positiveChannels.length === 0) {
    return { valid: false, reason: "allocationRequired" };
  }

  for (const channel of positiveChannels) {
    if (channel === "bcdWallet" && !availability.bcdEnabled) {
      return { valid: false, reason: "bcdUnavailable", channel };
    }
    if (channel === "evoWallet" && !availability.evoEnabled) {
      return { valid: false, reason: "railUnavailable", channel };
    }
    if (!employeeHasDestination(employee, channel)) {
      return {
        valid: false,
        reason: "destinationUnavailable",
        channel,
      };
    }
  }

  if (allocationTotal(amounts) !== salary) {
    return { valid: false, reason: "totalMismatch" };
  }

  return { valid: true };
};

export const buildAllocationRequest = (
  amounts: AllocationAmounts
): SalaryAllocationDraft[] =>
  (["bankAccount", "evoWallet", "bcdWallet"] as const)
    .map((paymentChannel) => ({
      paymentChannel,
      amount: roundSalaryAmount(amounts[paymentChannel]),
    }))
    .filter((allocation) => allocation.amount > 0);

export const normalizeWalletRecipientType = (
  value?: string | null
): WalletRecipientType =>
  value === "phoneNumber" ? "phoneNumber" : "evoId";

export const walletRecipientLooksValid = (
  value: string | null | undefined,
  type: WalletRecipientType
): boolean => {
  const normalized = normalizeDestination(value);
  if (!normalized) return false;
  if (type === "phoneNumber") return /^\+[0-9]{8,15}$/.test(normalized);
  return /^[A-Za-z0-9_-]{1,34}$/.test(normalized);
};
