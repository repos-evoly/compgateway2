"use client";

import {
  BeneficiaryPayload,
  BeneficiaryResponse,
  BeneficiariesApiResponse,
} from "./types";
import beneficiariesData from "./beneficiariesData.json";

// In-memory storage for demo purposes
const beneficiaries = [...beneficiariesData.data];
let nextId = Math.max(...beneficiaries.map((b) => b.id)) + 1;

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function createBeneficiary(
  payload: BeneficiaryPayload
): Promise<BeneficiaryResponse> {
  // Simulate API delay
  await delay(500);

  let newBeneficiary: BeneficiaryResponse;
  if (payload.type === 'local') {
    newBeneficiary = {
      id: nextId++,
      ...payload,
      amount: payload.amount ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else {
    newBeneficiary = {
      id: nextId++,
      ...payload,
      intermediaryBankSwift: payload.intermediaryBankSwift || "",
      intermediaryBankName: payload.intermediaryBankName || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  beneficiaries.push(newBeneficiary);
  return newBeneficiary;
}

export async function getBeneficiaries(
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<BeneficiariesApiResponse> {
  // Simulate API delay
  await delay(300);

  let filteredData = [...beneficiaries];

  // Apply search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredData = filteredData.filter((beneficiary) => {
      const searchableFields: string[] = [
        beneficiary.name,
        beneficiary.accountNumber,
        beneficiary.type,
      ];
      if (beneficiary.type === "local") {
        searchableFields.push(beneficiary.bank || "");
        if (typeof beneficiary.amount === 'number') {
          searchableFields.push(beneficiary.amount.toString());
        }
      } else {
        searchableFields.push(
          beneficiary.address || "",
          beneficiary.country || "",
          beneficiary.intermediaryBankSwift || "",
          beneficiary.intermediaryBankName || ""
        );
      }
      return searchableFields.some(field =>
        field?.toLowerCase().includes(searchLower)
      );
    });
  }

  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex) as BeneficiaryResponse[];
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

export async function getBeneficiaryById(
  id: number
): Promise<BeneficiaryResponse> {
  // Simulate API delay
  await delay(200);

  const beneficiary = beneficiaries.find((b) => b.id === id);
  if (!beneficiary) {
    throw new Error("Beneficiary not found");
  }

  return beneficiary as BeneficiaryResponse;
}

export async function updateBeneficiary(
  id: number,
  payload: BeneficiaryPayload
): Promise<BeneficiaryResponse> {
  // Simulate API delay
  await delay(500);

  const index = beneficiaries.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error("Beneficiary not found");
  }

  let updatedBeneficiary: BeneficiaryResponse;
  if (payload.type === 'local') {
    updatedBeneficiary = {
      ...beneficiaries[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
  } else {
    updatedBeneficiary = {
      ...beneficiaries[index],
      ...payload,
      intermediaryBankSwift: payload.intermediaryBankSwift || "",
      intermediaryBankName: payload.intermediaryBankName || "",
      updatedAt: new Date().toISOString(),
    };
  }

  beneficiaries[index] = updatedBeneficiary;
  return updatedBeneficiary;
}

export async function deleteBeneficiary(id: number): Promise<void> {
  // Simulate API delay
  await delay(300);

  const index = beneficiaries.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error("Beneficiary not found");
  }

  beneficiaries.splice(index, 1);
}
