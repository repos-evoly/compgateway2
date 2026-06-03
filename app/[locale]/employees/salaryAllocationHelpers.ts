export const EMPTY_BANK_ACCOUNT = "0000000000000";

export type SalaryPaymentChannel = "account" | "bcd" | "evo";

export type SalaryAllocationSource = {
  salary?: number | null;
  accountNumber?: string | null;
  evoWallet?: string | null;
  bcdWallet?: string | null;
  accountAllocationAmount?: number | null;
  bcdAllocationAmount?: number | null;
  evoAllocationAmount?: number | null;
};

export type SalaryAllocationInput = {
  paymentChannel: SalaryPaymentChannel;
  amount: number;
  destination: string;
};

const trim = (value?: string | null): string => value?.trim() ?? "";

export const toAmount = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export const roundAmount = (value: number): number =>
  Math.round((Number(value) || 0) * 1000) / 1000;

export const hasBankDestination = (row: SalaryAllocationSource): boolean => {
  const account = trim(row.accountNumber);
  return /^\d{13}$/.test(account) && account !== EMPTY_BANK_ACCOUNT;
};

export const hasBcdDestination = (row: SalaryAllocationSource): boolean =>
  trim(row.bcdWallet).length > 0;

export const hasEvoDestination = (row: SalaryAllocationSource): boolean =>
  trim(row.evoWallet).length > 0;

export const hasAnyDestination = (row: SalaryAllocationSource): boolean =>
  hasBankDestination(row) || hasBcdDestination(row) || hasEvoDestination(row);

export const allocationAmountForChannel = (
  row: SalaryAllocationSource,
  channel: SalaryPaymentChannel
): number => {
  switch (channel) {
    case "account":
      return roundAmount(toAmount(row.accountAllocationAmount));
    case "bcd":
      return roundAmount(toAmount(row.bcdAllocationAmount));
    case "evo":
      return roundAmount(toAmount(row.evoAllocationAmount));
  }
};

export const allocationTotal = (row: SalaryAllocationSource): number =>
  roundAmount(
    allocationAmountForChannel(row, "account") +
      allocationAmountForChannel(row, "bcd") +
      allocationAmountForChannel(row, "evo")
  );

export const hasAnyAllocation = (row: SalaryAllocationSource): boolean =>
  allocationTotal(row) > 0;

export const destinationForChannel = (
  row: SalaryAllocationSource,
  channel: SalaryPaymentChannel
): string => {
  switch (channel) {
    case "account":
      return trim(row.accountNumber);
    case "bcd":
      return trim(row.bcdWallet);
    case "evo":
      return trim(row.evoWallet);
  }
};

export const channelHasDestination = (
  row: SalaryAllocationSource,
  channel: SalaryPaymentChannel
): boolean => {
  switch (channel) {
    case "account":
      return hasBankDestination(row);
    case "bcd":
      return hasBcdDestination(row);
    case "evo":
      return hasEvoDestination(row);
  }
};

export type AllocationValidationResult = {
  valid: boolean;
  reason?: "missing_destination" | "missing_allocation" | "disabled_channel_amount" | "total_mismatch";
};

export const validateAllocations = (
  row: SalaryAllocationSource
): AllocationValidationResult => {
  if (!hasAnyDestination(row)) {
    return { valid: false, reason: "missing_destination" };
  }

  if (!hasAnyAllocation(row)) {
    return { valid: false, reason: "missing_allocation" };
  }

  const channels: SalaryPaymentChannel[] = ["account", "bcd", "evo"];
  const hasAmountForMissingDestination = channels.some(
    (channel) =>
      allocationAmountForChannel(row, channel) > 0 &&
      !channelHasDestination(row, channel)
  );
  if (hasAmountForMissingDestination) {
    return { valid: false, reason: "disabled_channel_amount" };
  }

  if (allocationTotal(row) !== roundAmount(toAmount(row.salary))) {
    return { valid: false, reason: "total_mismatch" };
  }

  return { valid: true };
};

export const buildAllocationInputs = (
  row: SalaryAllocationSource
): SalaryAllocationInput[] => {
  const channels: SalaryPaymentChannel[] = ["account", "bcd", "evo"];
  return channels
    .map((channel) => ({
      paymentChannel: channel,
      amount: allocationAmountForChannel(row, channel),
      destination: destinationForChannel(row, channel),
    }))
    .filter(
      (allocation) =>
        allocation.amount > 0 &&
        allocation.destination.length > 0 &&
        channelHasDestination(row, allocation.paymentChannel)
    );
};
