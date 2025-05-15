"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import CheckRequestForm from "../components/CheckRequestForm";
import { getCheckRequestById } from "../services";
import { TCheckRequestValues, TCheckRequestFormValues } from "../types";

const CheckRequestDetailPage = () => {
  const { id } = useParams(); // /checkrequest/[id]
  const t = useTranslations("CheckRequest");

  const [loading, setLoading] = useState(true);
  const [checkData, setCheckData] = useState<TCheckRequestValues | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const item = await getCheckRequestById(id.toString());
        setCheckData(item);
      } catch (error) {
        console.error("Failed to fetch check request:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="p-4">{t("loading")}</div>;
  }

  if (!checkData) {
    return (
      <div className="p-4">
        <p className="text-red-500">{t("noItemFound")}</p>
      </div>
    );
  }

  // Convert the API shape -> form shape
  const initialFormValues: TCheckRequestFormValues = {
    branch: checkData.branch,
    branchNum: checkData.branchNum,
    /** Convert date string to a JS Date for the form */
    date: new Date(checkData.date),
    customerName: checkData.customerName,
    cardNum: checkData.cardNum,
    accountNum: checkData.accountNum,
    beneficiary: checkData.beneficiary,
    lineItems: checkData.lineItems.map((li) => ({
      dirham: li.dirham,
      lyd: li.lyd,
    })),
  };

  // For now, let's just log if we "submit" from the detail page
  // If you want to do an update, you'd do a PUT/PATCH here
  const handleFormSubmit = (values: TCheckRequestFormValues) => {
    console.log("Update not implemented yet. Received:", values);
  };

  const handleFormCancel = () => {
    console.log(
      "Cancelled. Possibly go back to the list or do something else."
    );
  };

  return (
    <div className="p-4">
      <CheckRequestForm
        initialValues={initialFormValues}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    </div>
  );
};

export default CheckRequestDetailPage;
