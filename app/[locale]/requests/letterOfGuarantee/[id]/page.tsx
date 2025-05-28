"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import LetterOfGuaranteeForm from "../components/LetterOfGuaranteeForm";
import type { TLetterOfGuarantee } from "../types";
import { getLetterOfGuaranteeById } from "../services";

/**
 * Detail/Edit page for a single letterOfGuarantee:
 * GET /creditfacilities/{id}? => show the item in form => user can update
 */
export default function LetterOfGuaranteeDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [guaranteeData, setGuaranteeData] = useState<TLetterOfGuarantee | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1) On mount, fetch the record by ID
  useEffect(() => {
    const fetchOne = async () => {
      try {
        if (!params.id) return;
        const numericId = Number(params.id);
        if (Number.isNaN(numericId)) {
          setError("Invalid ID parameter");
          setLoading(false);
          return;
        }

        const apiItem = await getLetterOfGuaranteeById(numericId);

        // Convert to local TLetterOfGuarantee shape
        const converted: TLetterOfGuarantee = {
          id: apiItem.id,
          accountNumber: apiItem.accountNumber,
          date: apiItem.date,
          amount: apiItem.amount,
          purpose: apiItem.purpose,
          additionalInfo: apiItem.additionalInfo,
          curr: apiItem.curr,
          refferenceNumber: apiItem.referenceNumber,
          type: apiItem.type, // always "letterOfGuarantee"
        };

        setGuaranteeData(converted);
      } catch (err) {
        console.error("Failed to fetch letterOfGuarantee detail:", err);
        setError("فشل جلب خطاب الضمان المطلوب");
      } finally {
        setLoading(false);
      }
    };

    fetchOne();
  }, [params.id]);

  // 2) Loading or error states
  if (loading) {
    return <div className="p-4">جاري التحميل...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!guaranteeData) {
    return (
      <div className="p-4 text-red-500">
        لم يتم العثور على خطاب الضمان المطلوب.
      </div>
    );
  }

  // 3) On form submit => pretend update or do real update
  const handleUpdate = (updatedItem: TLetterOfGuarantee) => {
    console.log("Updated letterOfGuarantee:", updatedItem);
    alert("تم تحديث خطاب الضمان بنجاح!");
    router.push("/letterofguarantee");
  };

  // 4) If user cancels => go back
  const handleCancel = () => {
    router.push("/letterofguarantee");
  };

  // 5) Render the form with the fetched data, in read-only mode
  return (
    <div className="p-4">
      <LetterOfGuaranteeForm
        initialData={guaranteeData}
        onSubmit={handleUpdate}
        onCancel={handleCancel}
        readOnly // <--- This makes the form read-only
      />
    </div>
  );
}
