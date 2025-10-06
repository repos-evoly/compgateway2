"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import CreditFacilityForm from "../components/CreditFacilityForm";
import type { TCreditFacility } from "../types";
import { getCreditFacilityById, updateCreditFacilityById } from "../services";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal"; // ← NEW
import LoadingPage from "@/app/components/reusable/Loading";

/**
 * Detail/Edit page for a single credit facility:
 * GET /creditfacilities/{id} -> Display in form -> (pretend) update
 */
export default function CreditFacilityDetailPage() {
  const params = useParams<{ locale: string; id: string }>();
  const locale = params?.locale ?? "ar";
  const router = useRouter();

  /* ─── Data state ─────────────────────────────────────────── */
  const [facilityData, setFacilityData] = useState<TCreditFacility | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ─── Modal state (NEW) ──────────────────────────────────── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ─── Fetch record on mount ──────────────────────────────── */
  useEffect(() => {
    async function fetchOne() {
      try {
        if (!params?.id) return;

        const numericId = Number(params.id);
        if (Number.isNaN(numericId)) {
          setError("معرّف غير صالح");
          setModalOpen(true);
          setLoading(false);
          return;
        }

        const apiItem = await getCreditFacilityById(numericId);

        const converted: TCreditFacility = {
          id: apiItem.id,
          accountNumber: apiItem.accountNumber,
          date: apiItem.date,
          amount: apiItem.amount,
          purpose: apiItem.purpose,
          additionalInfo: apiItem.additionalInfo,
          curr: apiItem.curr,
          refferenceNumber: apiItem.referenceNumber,
          type: apiItem.type,
          status: apiItem.status,
          reason: apiItem.reason, // Assuming this field exists in the API response
        };

        setFacilityData(converted);
      } catch (err) {
        console.error("Failed to fetch credit facility detail:", err);
        setError("فشل جلب التسهيل الائتماني");
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    }

    fetchOne();
  }, [params.id]);

  /* ─── Loading / error fallback in page view ──────────────── */
  if (loading) {
    return <LoadingPage />;
  }

  if (!facilityData) {
    return (
      <>
        <div className="p-4 text-red-500">
          {error ?? "لم يتم العثور على التسهيل الائتماني المطلوب."}
        </div>

        {/* Error modal */}
        <ErrorOrSuccessModal
          isOpen={modalOpen}
          isSuccess={false}
          title="خطأ"
          message={error ?? "فشل جلب التسهيل الائتماني"}
          onClose={() => setModalOpen(false)}
          onConfirm={() => {
            setModalOpen(false);
            router.push(`/${locale}/creditfacility`);
          }}
        />
      </>
    );
  }

  /* ─── Handlers for pretend update / cancel ──────────────── */
  const handleUpdate = async (updatedItem: TCreditFacility) => {
    if (!facilityData?.id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await updateCreditFacilityById(
        facilityData.id,
        updatedItem
      );
      setFacilityData({
        id: result.id,
        accountNumber: result.accountNumber,
        date: result.date,
        amount: result.amount,
        purpose: result.purpose,
        additionalInfo: result.additionalInfo,
        curr: result.curr,
        refferenceNumber: result.referenceNumber, // map field
        type: result.type,
        status: result.status,
      });
      setModalTitle("تم التحديث بنجاح");
      setModalMessage("تم تحديث التسهيل الائتماني بنجاح.");
      setModalSuccess(true);
      setModalOpen(true);
      // Optionally redirect after a delay:
      // setTimeout(() => router.push("/creditfacility"), 1500);
    } catch (err) {
      setModalTitle("خطأ");
      setModalMessage(
        err instanceof Error ? err.message : "فشل تحديث التسهيل الائتماني"
      );
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => router.push(`/${locale}/creditfacility`);

  /* ─── Render form ────────────────────────────────────────── */
  return (
    <>
      <div className="p-4">
        <CreditFacilityForm
          initialData={facilityData}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          readOnly={facilityData.status !== "Pending"}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Error modal (in case fetch succeeded but later errors) */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={() => {
          setModalOpen(false);
          if (modalSuccess) router.push(`/${locale}/creditfacility`);
        }}
        onConfirm={() => {
          setModalOpen(false);
          if (modalSuccess) router.push(`/${locale}/creditfacility`);
      }}
      />
    </>
  );
}
