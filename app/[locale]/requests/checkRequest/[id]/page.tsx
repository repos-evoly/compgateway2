"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import CheckRequestForm from "../components/CheckRequestForm";
import { getCheckRequestById } from "../services";
import { TCheckRequestValues, TCheckRequestFormValues } from "../types";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import LoadingPage from "@/app/components/reusable/Loading";

const CheckRequestDetailPage = () => {
  const { id } = useParams(); // /checkrequest/[id]
  const t = useTranslations("CheckRequest");

  const [loading, setLoading] = useState(true);
  const [checkData, setCheckData] = useState<TCheckRequestValues | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const item = await getCheckRequestById(id.toString());
        setCheckData(item);
      } catch (error) {
        const msg = error instanceof Error ? error.message : t("genericError");
        setModalTitle(t("errorTitle"));
        setModalMessage(msg);
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, t]); // ← added t

  if (loading) {
    return <LoadingPage />;
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
    status: checkData.status,
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
        readOnly // <<< Make the form read-only
      />
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={false}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
      />
    </div>
  );
};

export default CheckRequestDetailPage;
