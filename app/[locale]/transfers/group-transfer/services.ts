"use client";

import groupTransfersData from "./groupTransfersData.json";
import type { TransfersApiResponse, TransferResponse, TransferPayload } from "./types";

// In-memory storage for demo purposes
const groupTransfers: Record<string, unknown>[] = [...groupTransfersData.data];
let nextId = Math.max(...groupTransfers.map((t) => t.id as number)) + 1;

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ensureTransferResponse(obj: Record<string, unknown>): TransferResponse {
  return {
    id: obj.id as number,
    transactionCategoryId: obj.transactionCategoryId as number ?? 1,
    fromAccount: obj.fromAccount as string,
    toAccount: obj.toAccount as string,
    amount: obj.amount as number,
    currencyId: obj.currencyId as number ?? 1,
    description: obj.description as string,
    createdAt: obj.createdAt as string ?? new Date().toISOString(),
    updatedAt: obj.updatedAt as string ?? new Date().toISOString(),
    // Optionals
    commissionOnRecipient: obj.commissionOnRecipient as boolean | undefined,
    economicSectorId: obj.economicSectorId as number | undefined,
  };
}

export async function getTransfers(page = 1, limit = 10, searchTerm = ""): Promise<TransfersApiResponse> {
  await delay(300);
  let filteredData = [...groupTransfers];
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredData = filteredData.filter((transfer) => {
      const searchableFields = [
        transfer.categoryName,
        transfer.fromAccount,
        transfer.toAccount,
        transfer.status,
        transfer.description,
      ];
      return searchableFields.some(field =>
        typeof field === 'string' ? field.toLowerCase().includes(searchLower) : false
      );
    });
  }
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex).map((t: Record<string, unknown>) => ({
    id: t.id as number,
    userId: t.userId as number ?? 1,
    categoryName: t.categoryName as string ?? "Manual Entry",
    fromAccount: t.fromAccount as string,
    toAccount: t.toAccount as string,
    amount: t.amount as number,
    currencyCode: t.currencyCode as string ?? "USD",
    packageName: t.packageName as string ?? "Standard",
    status: t.status as string ?? "Pending",
    requestedAt: t.requestedAt as string ?? new Date().toISOString(),
    description: t.description as string ?? "",
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
  await delay(200);
  const transfer = groupTransfers.find((t: Record<string, unknown>) => t.id === id);
  if (!transfer) throw new Error("Transfer not found");
  return ensureTransferResponse(transfer);
}

export async function createTransfer(payload: TransferPayload): Promise<TransferResponse> {
  await delay(500);
  const now = new Date().toISOString();
  const newTransfer: Record<string, unknown> = {
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

export async function updateTransfer(id: number, payload: TransferPayload): Promise<TransferResponse> {
  await delay(500);
  const index = groupTransfers.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Transfer not found");
  const now = new Date().toISOString();
  const updatedTransfer: Record<string, unknown> = {
    ...groupTransfers[index],
    ...payload,
    updatedAt: now,
  };
  groupTransfers[index] = updatedTransfer;
  return ensureTransferResponse(updatedTransfer);
}

export async function deleteTransfer(id: number): Promise<void> {
  await delay(300);
  const index = groupTransfers.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Transfer not found");
  groupTransfers.splice(index, 1);
}
