"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import BeneficiaryForm from "../components/BeneficiaryForm";
import { getBeneficiaryById } from "../services";
import type { BeneficiaryFormValues } from "../types";
import LoadingPage from "@/app/components/reusable/Loading";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

export default function BeneficiaryDetailsPage() {
  const params = useParams<{ locale: string; id: string }>();
  const locale = params?.locale ?? "ar";
  const id = params?.id;
  const router = useRouter();
  const t = useTranslations("beneficiaries");

  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<BeneficiaryFormValues | null>(null);
  // Removed isEditMode state since we always edit now
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* ---------------------- fetch by id --------------------- */
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await getBeneficiaryById(Number(id));
        /* map API response → BeneficiaryFormValues */
        if (res.type === "local" || res.type === "Individual") {
          setInitial({
            id: res.id,
            type: "local",
            name: res.name,
            accountNumber: res.accountNumber,
            bank: res.bank || "",
            amount: res.amount || 0,
            address: res.address || "",
            country: res.country || "Libya",
          });
        } else {
          setInitial({
            id: res.id,
            type: "international",
            name: res.name,
            accountNumber: res.accountNumber,
            address: res.address || "",
            country: res.country || "",
            intermediaryBankSwift: res.intermediaryBankSwift || "",
            intermediaryBankName: res.intermediaryBankName || "",
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

  const handleBack = () => {
    router.push(`/${locale}/beneficiaries`);
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!initial) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">Beneficiary not found</h2>
        <button
          onClick={() => router.push(`/${locale}/beneficiaries`)}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded p-2">
      {/* Beneficiary form in edit mode */}
      <BeneficiaryForm
        initialData={initial}
        viewOnly={false} // Always editable
        onSuccess={handleBeneficiaryUpdated}
        onBack={handleBack}
      />

      {/* Success/Error Modal */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
          onClose={() => {
            setModalOpen(false);
            if (modalSuccess) {
              router.push(`/${locale}/beneficiaries`);
            }
          }}
          onConfirm={() => {
            setModalOpen(false);
            if (modalSuccess) {
              router.push(`/${locale}/beneficiaries`);
            }
          }}
      />
    </div>
  );
}
