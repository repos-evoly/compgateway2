"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import CheckbookForm from "../components/CheckbookForm";
import type { TCheckbookValues, TCheckbookFormValues } from "../types";
import { getCheckbookRequestById } from "../services";

/**
 * Detail/Edit page for a single checkbook request.
 */
const CheckbookDetailPage: React.FC = () => {
  const t = useTranslations("checkForm");
  const { id } = useParams(); // The ID in the URL: /checkbook/123

  // Local state for the fetched record
  const [checkbookData, setCheckbookData] = useState<TCheckbookValues | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Fetch the checkbook request by ID on mount
  useEffect(() => {
    const fetchById = async () => {
      try {
        if (!id) return;
        const result = await getCheckbookRequestById(id.toString());
        setCheckbookData(result);
      } catch (error) {
        console.error("Failed to fetch single checkbook:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchById();
  }, [id]);

  // We'll show a loading indicator if data is not yet fetched
  if (loading) {
    return (
      <div className="p-4">
        <p>{t("loading")}</p>
      </div>
    );
  }

  // If there's an error or no data
  if (!checkbookData) {
    return (
      <div className="p-4">
        <p className="text-red-500">{t("noItemFound")}</p>
      </div>
    );
  }

  // Convert our TCheckbookValues into TCheckbookFormValues
  // (the form expects only certain fields)
  const initialValues: TCheckbookFormValues = {
    fullName: checkbookData.fullName ?? "",
    address: checkbookData.address ?? "",
    accountNumber: checkbookData.accountNumber ?? "",
    pleaseSend: checkbookData.pleaseSend ?? "",
    branch: checkbookData.branch ?? "",
    date: checkbookData.date ?? "",
    bookContaining: checkbookData.bookContaining ?? "",
  };

  // For now, let's just console.log on form submit
  const handleFormSubmit = (updatedItem: TCheckbookFormValues) => {
    console.log("Submitted updated item:", updatedItem);
    // Later you could do an "updateCheckbookRequest(updatedItem)" if needed
  };

  // For now, just go back or something if you want to cancel
  const handleFormCancel = () => {
    // Could router.back() if desired
    console.log("Cancelled form");
  };

  return (
    <div className="p-4">
      <CheckbookForm
        initialData={initialValues}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    </div>
  );
};

export default CheckbookDetailPage;
