"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import BeneficiaryForm from "../../components/BeneficiaryForm";
import { getBeneficiaryById } from "../../services";
import type { BeneficiaryFormValues } from "../../types";
import LoadingPage from "@/app/components/reusable/Loading";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

export default function EditBeneficiaryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("beneficiaries");

  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<BeneficiaryFormValues | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* ---------------------- fetch by id --------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getBeneficiaryById(Number(id));
        /* map API response → BeneficiaryFormValues */
        if (res.type === "local") {
          setInitial({
            id: res.id,
            type: "local",
            name: res.name,
            accountNumber: res.accountNumber,
            bank: res.bank,
            amount: res.amount,
          });
        } else {
          setInitial({
            id: res.id,
            type: "international",
            name: res.name,
            accountNumber: res.accountNumber,
            address: res.address,
            country: res.country,
            intermediaryBankSwift: res.intermediaryBankSwift,
            intermediaryBankName: res.intermediaryBankName,
          });
        }
      } catch (err) {
        console.error("Fetch beneficiary failed:", err);
        setModalTitle(t("errorTitle"));
        setModalMessage(err instanceof Error ? err.message : t("unknownError"));
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, t]);

  const handleBeneficiaryUpdated = () => {
    setModalTitle(t("updateSuccessTitle"));
    setModalMessage(t("updateSuccessMsg"));
    setModalSuccess(true);
    setModalOpen(true);
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!initial) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">Beneficiary not found</h2>
        <button
          onClick={() => router.push("/beneficiaries")}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="">
      <BeneficiaryForm 
        initialData={initial} 
        onSuccess={handleBeneficiaryUpdated} 
      />

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={() => {
          setModalOpen(false);
          if (modalSuccess) {
            router.push("/beneficiaries");
          }
        }}
        onConfirm={() => {
          setModalOpen(false);
          if (modalSuccess) {
            router.push("/beneficiaries");
          }
        }}
      />
    </div>
  );
} 