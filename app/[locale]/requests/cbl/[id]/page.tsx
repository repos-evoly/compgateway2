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
  const [error, setError] = useState<string | null>(null);

  // Fetch the single CBL request on mount
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await getCblRequestById(id.toString());
        if (!response) {
          setError(t("noItemFound"));
          setLoading(false);
          return;
        }
        setCblData(response);
      } catch (err) {
        console.error("Failed to fetch CBL by ID:", err);
        setError(t("noItemFound"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, t]);

  // Show a loading indicator while fetching
  if (loading) {
    return <div className="p-4">{t("loading")}</div>;
  }

  // If no data found or fetch failed
  if (error || !cblData) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error || t("noItemFound")}</p>
      </div>
    );
  }

  // Handler for form cancel
  const handleFormCancel = () => {
    console.log("Form cancelled");
    // Possibly navigate back => e.g. router.back();
  };

  // Render the form in read-only mode => fields disabled, no submit/cancel
  return (
    <div className="p-4">
      <CBLForm initialValues={cblData} onCancel={handleFormCancel} readOnly />
    </div>
  );
};

export default CblDetailPage;
