"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { TCBLValues } from "../types";
import { getCblRequestById } from "../service";
import CBLForm from "../components/CBLForm";

/**
 * Detail page for editing/viewing a single CBL request by ID.
 */
const CblDetailPage: React.FC = () => {
  const { id } = useParams(); // e.g. /cbl/123 => id = "123"
  const t = useTranslations("cblForm");

  const [cblData, setCblData] = useState<TCBLValues | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the single CBL request on mount
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const response = await getCblRequestById(id.toString());
        setCblData(response);
      } catch (err) {
        console.error("Failed to fetch CBL by ID:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Show a loading indicator while fetching
  if (loading) {
    return <div className="p-4">{t("loading")}</div>;
  }

  // If no data found or fetch failed
  if (!cblData) {
    return (
      <div className="p-4">
        <p className="text-red-500">{t("noItemFound")}</p>
      </div>
    );
  }

  // Handler for form submit
  const handleFormSubmit = (updatedValues: TCBLValues) => {
    console.log("Form updated values:", updatedValues);
    // You can call an "updateCblRequest" function if your API supports PUT/PATCH
    // For now, we just log to console
  };

  // Handler for form cancel
  const handleFormCancel = () => {
    console.log("Form cancelled");
    // Possibly navigate back
    // router.back();
  };

  // Render the form with prefilled data
  return (
    <div className="p-4">
      <CBLForm
        initialValues={cblData}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    </div>
  );
};

export default CblDetailPage;
