"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import RTGSForm from "../components/RTGSForm";
import { getRtgsRequestById, updateRtgsRequest } from "../services";
import { TRTGSFormValues, TRTGSValues } from "../types";
import LoadingPage from "@/app/components/reusable/Loading";

/**
 * RTGS Detail page => /rtgs/[id]
 * Fetches a single record and pre-fills the form.
 */
const RtgsDetailPage: React.FC = () => {
  const t = useTranslations("RTGSForm");
  const params = useParams<{ locale: string; id: string }>(); // The "[locale]/[id]" in the URL
  const locale = params?.locale ?? "ar";
  const id = params?.id;
  const router = useRouter();
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
    return <LoadingPage />;
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
    status: item.status,
    reason: item.reason || "", // Ensure reason is always a string
  };

  // Handle form submission for updates
  const handleFormSubmit = async (values: TRTGSFormValues) => {
    if (!id) return;

    try {
      // Convert form values back to API shape
      const updateValues: TRTGSValues = {
        ...values,
        refNum: values.refNum.toISOString(),
        date: values.date.toISOString(),
      };

      await updateRtgsRequest(id.toString(), updateValues);
      alert("RTGS request updated successfully!");
      router.push(`/${locale}/requests/rtgs`);
    } catch (error) {
      console.error("Failed to update RTGS request:", error);
      alert("Failed to update RTGS request!");
    }
  };

  const handleFormCancel = () => {
    router.push(`/${locale}/requests/rtgs`);
  };

  return (
    <div className="p-4">
      <RTGSForm
        initialValues={initialValues}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        readOnly={
          initialValues.status === undefined
            ? false
            : initialValues.status === "pending"
        }
      />
    </div>
  );
};

export default RtgsDetailPage;
