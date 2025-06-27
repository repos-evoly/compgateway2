"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import LetterOfGuaranteeForm from "../components/LetterOfGuaranteeForm";
import type { TLetterOfGuarantee } from "../types";
import { getLetterOfGuaranteeById } from "../services";

// ⬇️ NEW: modal import
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import LoadingPage from "@/app/components/reusable/Loading";

/**
 * Detail/Edit page for a single letterOfGuarantee:
 * GET /creditfacilities/{id} → show item in form (read-only)
 */
export default function LetterOfGuaranteeDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [guaranteeData, setGuaranteeData] = useState<TLetterOfGuarantee | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ────────── modal state ────────── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMsg, setModalMsg] = useState("");

  /* ────────── fetch on mount ─────── */
  useEffect(() => {
    const fetchOne = async () => {
      try {
        if (!params.id) return;

        const numericId = Number(params.id);
        if (Number.isNaN(numericId)) {
          setError("Invalid ID parameter");
          setModalTitle("خطأ");
          setModalMsg("معرّف غير صالح.");
          setModalSuccess(false);
          setModalOpen(true);
          setLoading(false);
          return;
        }

        const apiItem = await getLetterOfGuaranteeById(numericId);

        const converted: TLetterOfGuarantee = {
          id: apiItem.id,
          accountNumber: apiItem.accountNumber,
          date: apiItem.date,
          amount: apiItem.amount,
          purpose: apiItem.purpose,
          additionalInfo: apiItem.additionalInfo,
          curr: apiItem.curr,
          refferenceNumber: apiItem.referenceNumber,
          type: apiItem.type,
        };

        setGuaranteeData(converted);
      } catch (err) {
        console.error("Failed to fetch letterOfGuarantee detail:", err);
        setError("فشل جلب خطاب الضمان المطلوب");
        setModalTitle("خطأ");
        setModalMsg(
          err instanceof Error ? err.message : "فشل جلب خطاب الضمان المطلوب."
        );
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOne();
  }, [params.id]);

  /* ────────── handlers ───────────── */
  const handleUpdate = (updated: TLetterOfGuarantee) => {
    console.log("Updated letterOfGuarantee:", updated);
    setModalTitle("تم التحديث");
    setModalMsg("تم تحديث خطاب الضمان بنجاح!");
    setModalSuccess(true);
    setModalOpen(true);
  };

  const handleCancel = () => router.push("/letterofguarantee");

  /* ────────── ui states ──────────── */
  if (loading) return <LoadingPage />;
  if (error && !modalOpen)
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
      </div>
    );

  if (!guaranteeData)
    return (
      <div className="p-4 text-red-500">
        لم يتم العثور على خطاب الضمان المطلوب.
      </div>
    );

  /* ────────── render ─────────────── */
  return (
    <div className="p-4">
      <LetterOfGuaranteeForm
        initialData={guaranteeData}
        onSubmit={handleUpdate}
        onCancel={handleCancel}
        readOnly
      />

      {/* modal */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMsg}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false);
          if (modalSuccess) router.push("/letterofguarantee");
        }}
      />
    </div>
  );
}
