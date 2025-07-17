"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import { getForeignTransferById, updateForeignTransfer } from "../services";
import type {
  ForeignTransfersFormValues,
  ForeignTransferDetailResponse,
  CreateForeignTransferPayload,
} from "../types";
import ForeignTransfersForm from "../components/ForeignTransfersForm";
import LoadingPage from "@/app/components/reusable/Loading";

/**
 * A page to display/edit a single foreign transfer by ID.
 */
export default function ForeignTransfersDetailPage() {
  const { id } = useParams() || {};
  const router = useRouter();
  const t = useTranslations("foreignTransfers");

  const [initialValues, setInitialValues] =
    useState<ForeignTransfersFormValues | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Define the fetch logic inline
    (async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);

        const data: ForeignTransferDetailResponse =
          await getForeignTransferById(String(id));
        // Map API fields to your form shape
        const formData: ForeignTransfersFormValues = {
          id: data.id,
          toBank: data.toBank ?? '',
          branch: data.branch ?? '',
          residentSupplierName: data.residentSupplierName ?? '',
          residentSupplierNationality: data.residentSupplierNationality ?? '',
          nonResidentPassportNumber: data.nonResidentPassportNumber ?? '',
          placeOfIssue: data.placeOfIssue ?? '',
          dateOfIssue: data.dateOfIssue ?? '',
          nonResidentNationality: data.nonResidentNationality ?? '',
          nonResidentAddress: data.nonResidentAddress ?? '',
          transferAmount: data.transferAmount ?? 0,
          toCountry: data.toCountry ?? '',
          beneficiaryName: data.beneficiaryName ?? '',
          beneficiaryAddress: data.beneficiaryAddress ?? '',
          externalBankName: data.externalBankName ?? '',
          externalBankAddress: data.externalBankAddress ?? '',
          transferToAccountNumber: data.transferToAccountNumber ?? '',
          transferToAddress: data.transferToAddress ?? '',
          accountHolderName: data.accountHolderName ?? '',
          permanentAddress: data.permanentAddress ?? '',
          purposeOfTransfer: data.purposeOfTransfer ?? '',
          status: data.status ?? '',
          reason: data.reason ?? ''
        };

        setInitialValues(formData);
      } catch (err) {
        console.error("Failed to fetch foreign transfer detail:", err);
        const msg = err instanceof Error ? err.message : t("fetchDetailError");
        setError(msg);
        setModalOpen(true); // ← open modal
      } finally {
        setLoading(false);
      }
    })();
  }, [id, t]); // 'id' and 't' are used inside the effect

  async function handleSubmit(updatedValues: ForeignTransfersFormValues) {
    if (!id) return;
    
    try {
      // Convert form values to API payload
      const payload: CreateForeignTransferPayload = {
        toBank: updatedValues.toBank ?? '',
        branch: updatedValues.branch ?? '',
        residentSupplierName: updatedValues.residentSupplierName ?? '',
        residentSupplierNationality: updatedValues.residentSupplierNationality ?? '',
        nonResidentPassportNumber: updatedValues.nonResidentPassportNumber ?? '',
        placeOfIssue: updatedValues.placeOfIssue ?? '',
        dateOfIssue: updatedValues.dateOfIssue ?? '',
        nonResidentNationality: updatedValues.nonResidentNationality ?? '',
        nonResidentAddress: updatedValues.nonResidentAddress ?? '',
        transferAmount: updatedValues.transferAmount ?? 0,
        toCountry: updatedValues.toCountry ?? '',
        beneficiaryName: updatedValues.beneficiaryName ?? '',
        beneficiaryAddress: updatedValues.beneficiaryAddress ?? '',
        externalBankName: updatedValues.externalBankName ?? '',
        externalBankAddress: updatedValues.externalBankAddress ?? '',
        transferToAccountNumber: updatedValues.transferToAccountNumber ?? '',
        transferToAddress: updatedValues.transferToAddress ?? '',
        accountHolderName: updatedValues.accountHolderName ?? '',
        permanentAddress: updatedValues.permanentAddress ?? '',
        purposeOfTransfer: updatedValues.purposeOfTransfer ?? '',
        status: updatedValues.status ?? '',
        reason: updatedValues.reason ?? ''
      };
      
      await updateForeignTransfer(id.toString(), payload);
      alert("Foreign transfer updated successfully!");
      router.push("/requests/foreignTransfers");
    } catch (error) {
      console.error("Failed to update foreign transfer:", error);
      alert("Failed to update foreign transfer!");
    }
  }

  if (loading) {
    return <LoadingPage />;
  }
  if (error) {
    return (
      <div className="p-4 text-red-600">
        {t("error")} {error}
      </div>
    );
  }
  if (!initialValues) {
    return null; // or a skeleton if needed
  }

  return (
    <div className="p-4">
      {/* The same form you use for "add," pre-filled with initialValues */}
      <ForeignTransfersForm
        initialValues={initialValues}
        onSubmit={(values) => handleSubmit(values as unknown as ForeignTransfersFormValues)}
        readOnly={initialValues.status === undefined ? false : initialValues.status === "pending"}
      />
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={false}
        title={t("error")}
        message={error ?? t("fetchDetailError")}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false);
        }}
      />
    </div>
  );
}
