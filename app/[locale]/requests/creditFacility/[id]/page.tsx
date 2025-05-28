"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import CreditFacilityForm from "../components/CreditFacilityForm";
import type { TCreditFacility } from "../types";
import { getCreditFacilityById } from "../services";

/**
 * Detail/Edit page for a single credit facility:
 * GET /creditfacilities/{id} -> Display in form -> (pretend) update
 */
export default function CreditFacilityDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [facilityData, setFacilityData] = useState<TCreditFacility | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1) On mount, fetch the record by ID
  useEffect(() => {
    const fetchOne = async () => {
      try {
        if (!params.id) return; // or handle missing ID
        const numericId = Number(params.id);
        if (Number.isNaN(numericId)) {
          setError("Invalid ID parameter");
          setLoading(false);
          return;
        }

        const apiItem = await getCreditFacilityById(numericId);

        // Convert the API item shape to TCreditFacility if needed
        const converted: TCreditFacility = {
          id: apiItem.id,
          accountNumber: apiItem.accountNumber,
          date: apiItem.date,
          amount: apiItem.amount,
          purpose: apiItem.purpose,
          additionalInfo: apiItem.additionalInfo,
          curr: apiItem.curr, // e.g. "002"
          refferenceNumber: apiItem.referenceNumber, // map
          type: apiItem.type,
        };

        setFacilityData(converted);
      } catch (err) {
        console.error("Failed to fetch credit facility detail:", err);
        setError("فشل جلب التسهيل الائتماني");
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

  if (!facilityData) {
    return (
      <div className="p-4 text-red-500">
        لم يتم العثور على التسهيل الائتماني المطلوب.
      </div>
    );
  }

  // 3) On form submit => pretend update
  const handleUpdate = (updatedItem: TCreditFacility) => {
    console.log("Updated item:", updatedItem);
    alert("تم تحديث التسهيل بنجاح!");
    router.push("/creditfacility");
  };

  // 4) If user cancels, go back
  const handleCancel = () => {
    router.push("/creditfacility");
  };

  // 5) Render the form with the fetched data, in read-only mode
  return (
    <div className="p-4">
      <CreditFacilityForm
        initialData={facilityData}
        onSubmit={handleUpdate}
        onCancel={handleCancel}
        readOnly // <--- Make the form read-only
      />
    </div>
  );
}
