"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import CreditFacilityForm from "../components/CreditFacilityForm";
import type { TCreditFacility } from "../types";
import { getCreditFacilityById } from "../services";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal"; // ← NEW

/**
 * Detail/Edit page for a single credit facility:
 * GET /creditfacilities/{id} -> Display in form -> (pretend) update
 */
export default function CreditFacilityDetailPage() {
  const params = useParams();
  const router = useRouter();

  /* ─── Data state ─────────────────────────────────────────── */
  const [facilityData, setFacilityData] = useState<TCreditFacility | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ─── Modal state (NEW) ──────────────────────────────────── */
  const [modalOpen, setModalOpen] = useState(false);

  /* ─── Fetch record on mount ──────────────────────────────── */
  useEffect(() => {
    async function fetchOne() {
      try {
        if (!params.id) return;

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
    return <div className="p-4">جاري التحميل...</div>;
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
            router.push("/creditfacility");
          }}
        />
      </>
    );
  }

  /* ─── Handlers for pretend update / cancel ──────────────── */
  const handleUpdate = (updatedItem: TCreditFacility) => {
    console.log("Updated item:", updatedItem);
    router.push("/creditfacility");
  };

  const handleCancel = () => router.push("/creditfacility");

  /* ─── Render form ────────────────────────────────────────── */
  return (
    <>
      <div className="p-4">
        <CreditFacilityForm
          initialData={facilityData}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          readOnly
        />
      </div>

      {/* Error modal (in case fetch succeeded but later errors) */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={false}
        title="خطأ"
        message={error ?? ""}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false);
          router.push("/creditfacility");
        }}
      />
    </>
  );
}
