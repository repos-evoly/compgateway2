"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import RTGSForm from "../components/RTGSForm";
import { getRtgsRequestById } from "../services";
import { TRTGSFormValues, TRTGSValues } from "../types";

/**
 * RTGS Detail page => /rtgs/[id]
 * Fetches a single record and pre-fills the form.
 */
const RtgsDetailPage: React.FC = () => {
  const t = useTranslations("RTGSForm");
  const { id } = useParams(); // The "[id]" in the URL
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<TRTGSValues | null>(null);

  // Fetch on mount or when "id" changes
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const data = await getRtgsRequestById(id.toString());
        setItem(data);
      } catch (error) {
        console.error("Failed to fetch RTGS request by ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="p-4">{t("loading")}</div>;
  }

  if (!item) {
    return <div className="p-4 text-red-500">{t("noItemFound")}</div>;
  }

  // Convert API shape -> form shape
  // The API returns refNum/date as ISO strings => convert to Date
  const initialValues: TRTGSFormValues = {
    refNum: new Date(item.refNum),
    date: new Date(item.date),
    paymentType: item.paymentType,
    accountNo: item.accountNo,
    applicantName: item.applicantName,
    address: item.address,
    beneficiaryName: item.beneficiaryName,
    beneficiaryAccountNo: item.beneficiaryAccountNo,
    beneficiaryBank: item.beneficiaryBank,
    branchName: item.branchName,
    amount: item.amount,
    remittanceInfo: item.remittanceInfo,
    invoice: item.invoice,
    contract: item.contract,
    claim: item.claim,
    otherDoc: item.otherDoc,
  };

  // For now, just console.log if the user re-submits
  // If you want to do an update, you can add a "updateRtgsRequest" function
  const handleFormSubmit = (values: TRTGSFormValues) => {
    console.log("Update not implemented yet. Received:", values);
  };

  const handleFormCancel = () => {
    console.log("Cancelled form. Possibly redirect back to the list page.");
  };

  return (
    <div className="p-4">
      <RTGSForm
        initialValues={initialValues}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        readOnly // <--- Make the form read-only
      />
    </div>
  );
};

export default RtgsDetailPage;
