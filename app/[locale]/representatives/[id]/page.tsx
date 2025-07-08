"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";

import RepresentativesForm from "../components/RepresentativesForm";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import { getRepresentativeById } from "../services";
import type { Representative } from "../types";

export default function EditRepresentativePage() {
  const t = useTranslations("representatives");
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [representative, setRepresentative] = useState<Representative | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const fetchRepresentative = async () => {
      try {
        setLoading(true);
        const data = await getRepresentativeById(parseInt(id));
        setRepresentative(data);
      } catch (error) {
        console.error("Failed to fetch representative:", error);
        setModalOpen(true);
        setModalSuccess(false);
        setModalTitle(t("errorTitle"));
        setModalMessage(error instanceof Error ? error.message : t("unexpectedError"));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRepresentative();
    }
  }, [id, t]);

  const handleFormSubmit = async (success: boolean, message: string) => {
    setModalOpen(true);
    setModalSuccess(success);
    setModalTitle(success ? t("successTitle") : t("errorTitle"));
    setModalMessage(message);

    if (success) {
      // Navigate back to representatives list after successful update
      setTimeout(() => {
        router.push("/representatives");
      }, 1500);
    }
  };

  const handleCancel = () => {
    router.push("/representatives");
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!representative) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500">
          <p>{t("representativeNotFound")}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RepresentativesForm
        initialData={representative}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
      />

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
} 