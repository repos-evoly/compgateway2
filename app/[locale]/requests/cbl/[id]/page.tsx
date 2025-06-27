"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { TCBLValues } from "../types";
import { getCblRequestById } from "../service";
import CBLForm from "../components/CBLForm";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import LoadingPage from "@/app/components/reusable/Loading";

const CblDetailPage: React.FC = () => {
  const { id } = useParams(); // e.g. /cbl/123
  const t = useTranslations("cblForm");
  const router = useRouter();

  /* data + ui state */
  const [cblData, setCblData] = useState<TCBLValues | null>(null);
  const [loading, setLoading] = useState(true);

  /* modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* fetch on mount */
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const response = await getCblRequestById(id.toString());
        if (!response) {
          throw new Error(t("noItemFound"));
        }
        setCblData(response);
      } catch (err) {
        const msg = err instanceof Error ? err.message : t("genericError");

        setModalTitle(t("errorTitle"));
        setModalMessage(msg);
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, t]);

  /* handle modal close / confirm */
  const handleModalClose = () => setModalOpen(false);
  const handleModalConfirm = () => {
    setModalOpen(false);
    router.back(); // optional: navigate user away
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="p-4">
      {cblData && <CBLForm initialValues={cblData} readOnly />}

      {/* error modal */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={false}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default CblDetailPage;
