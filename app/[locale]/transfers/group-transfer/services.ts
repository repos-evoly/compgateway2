"use client";

import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { refreshAuthTokens } from "@/app/helpers/authentication/refreshTokens";
import groupTransfersData from "./groupTransfersData.json";
import type {
  TransfersApiResponse,
  TransferResponse,
  TransferPayload,
} from "./types";

/* --------------------------- Local Types --------------------------- */
type StoredTransfer = {
  id: number;
  userId?: number;
  categoryName?: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currencyCode?: string;
  packageName?: string;
  status?: string;
  requestedAt?: string;
  description?: string;
  transactionCategoryId?: number;
  currencyId?: number;
  createdAt?: string;
  updatedAt?: string;
  commissionOnRecipient?: boolean;
  economicSectorId?: number;
  isGroupTransfer?: boolean;
};

/* ------------------------ In-memory storage ------------------------ */
const groupTransfers: StoredTransfer[] = [
  ...(groupTransfersData.data as StoredTransfer[]),
];

let nextId =
  groupTransfers.length > 0
    ? Math.max(...groupTransfers.map((t) => t.id)) + 1
    : 1;

/* ------------------------------ Utils ------------------------------ */
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const ensureTransferResponse = (obj: StoredTransfer): TransferResponse => {
  return {
    id: obj.id,
    transactionCategoryId: obj.transactionCategoryId ?? 1,
    fromAccount: obj.fromAccount,
    toAccount: obj.toAccount,
    amount: obj.amount,
    currencyId: obj.currencyId ?? 1,
    description: obj.description ?? "",
    createdAt: obj.createdAt ?? new Date().toISOString(),
    updatedAt: obj.updatedAt ?? new Date().toISOString(),
    commissionOnRecipient: obj.commissionOnRecipient,
    economicSectorId: obj.economicSectorId,
  };
};

/**
 * Ensure an access token exists. If missing, try refreshing once.
 * Throws if still not available.
 */
const ensureToken = async (): Promise<string> => {
  let token = getAccessTokenFromCookies();
  if (!token) {
    try {
      const refreshed = await refreshAuthTokens();
      token = refreshed.accessToken;
    } catch {
      // ignore and check again below
    }
  }
  if (!token) {
    throw new Error("No access token found in cookies");
  }
  return token;
};

/* ----------------------------- Services ---------------------------- */
export async function getTransfers(
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<TransfersApiResponse> {
  await ensureToken(); // uniform auth check as in real services
  await delay(300);

  let filteredData: StoredTransfer[] = [...groupTransfers];

  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    filteredData = filteredData.filter((t) => {
      const fields: Array<string | undefined> = [
        t.categoryName,
        t.fromAccount,
        t.toAccount,
        t.status,
        t.description,
      ];
      return fields.some((f) => (typeof f === "string" ? f.toLowerCase().includes(q) : false));
    });
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedData = filteredData.slice(startIndex, endIndex).map((t) => ({
    id: t.id,
    userId: t.userId ?? 1,
    categoryName: t.categoryName ?? "Manual Entry",
    fromAccount: t.fromAccount,
    toAccount: t.toAccount,
    amount: t.amount,
    currencyCode: t.currencyCode ?? "USD",
    packageName: t.packageName ?? "Standard",
    status: t.status ?? "Pending",
    requestedAt: t.requestedAt ?? new Date().toISOString(),
    description: t.description ?? "",
  }));

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / limit);

  return {
    data: paginatedData,
    page,
    limit,
    totalPages,
    totalRecords,
  };
}

export async function getTransferById(id: number): Promise<TransferResponse> {
  await ensureToken();
  await delay(200);

  const transfer = groupTransfers.find((t) => t.id === id);
  if (!transfer) throw new Error("Transfer not found");
  return ensureTransferResponse(transfer);
}

export async function createTransfer(
  payload: TransferPayload
): Promise<TransferResponse> {
  await ensureToken();
  await delay(500);

  const now = new Date().toISOString();

  const newTransfer: StoredTransfer = {
    id: nextId++,
    transactionCategoryId: payload.transactionCategoryId ?? 1,
    fromAccount: payload.fromAccount,
    toAccount: payload.toAccount,
    amount: payload.amount,
    currencyId: payload.currencyId ?? 1,
    description: payload.description,
    createdAt: now,
    updatedAt: now,
    userId: 1,
    categoryName: "Manual Entry",
    currencyCode: "USD",
    packageName: "Standard",
    status: "Pending",
    requestedAt: now,
    commissionOnRecipient: payload.commissionOnRecipient,
    economicSectorId: payload.economicSectorId,
  };

  groupTransfers.push(newTransfer);
  return ensureTransferResponse(newTransfer);
}

export async function createGroupTransfer(payload: {
  fromAccount: string;
  toAccounts: string[];
  amount: number;
  description: string;
  currencyId?: number;
  transactionCategoryId?: number;
  commissionOnRecipient?: boolean;
  economicSectorId?: number;
}): Promise<TransferResponse> {
  await ensureToken();
  await delay(500);

  const now = new Date().toISOString();
  const toAccountString = payload.toAccounts.join(", ");

  const newTransfer: StoredTransfer = {
    id: nextId++,
    transactionCategoryId: payload.transactionCategoryId ?? 1,
    fromAccount: payload.fromAccount,
    toAccount: toAccountString,
    amount: payload.amount,
    currencyId: payload.currencyId ?? 1,
    description: payload.description,
    createdAt: now,
    updatedAt: now,
    userId: 1,
    categoryName: "Group Transfer",
    currencyCode: "USD",
    packageName: "Standard",
    status: "Pending",
    requestedAt: now,
    commissionOnRecipient: payload.commissionOnRecipient,
    economicSectorId: payload.economicSectorId,
    isGroupTransfer: true,
  };

  groupTransfers.push(newTransfer);
  return ensureTransferResponse(newTransfer);
}

export async function updateTransfer(
  id: number,
  payload: TransferPayload
): Promise<TransferResponse> {
  await ensureToken();
  await delay(500);

  const index = groupTransfers.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Transfer not found");

  const now = new Date().toISOString();

  const updatedTransfer: StoredTransfer = {
    ...groupTransfers[index],
    transactionCategoryId:
      payload.transactionCategoryId ?? groupTransfers[index].transactionCategoryId ?? 1,
    fromAccount: payload.fromAccount ?? groupTransfers[index].fromAccount,
    toAccount: payload.toAccount ?? groupTransfers[index].toAccount,
    amount: payload.amount ?? groupTransfers[index].amount,
    currencyId: payload.currencyId ?? groupTransfers[index].currencyId ?? 1,
    description: payload.description ?? groupTransfers[index].description ?? "",
    updatedAt: now,
    commissionOnRecipient:
      payload.commissionOnRecipient ?? groupTransfers[index].commissionOnRecipient,
    economicSectorId:
      payload.economicSectorId ?? groupTransfers[index].economicSectorId,
  };

  groupTransfers[index] = updatedTransfer;
  return ensureTransferResponse(updatedTransfer);
}

export async function deleteTransfer(id: number): Promise<void> {
  await ensureToken();
  await delay(300);

  const index = groupTransfers.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Transfer not found");
  groupTransfers.splice(index, 1);
}
