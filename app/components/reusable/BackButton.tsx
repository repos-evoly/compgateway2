"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export type BackButtonProps = {
  /** Optional path to go to instead of just “back” */
  fallbackPath?: string;
  isEditing?: boolean;
};

const BackButton: React.FC<BackButtonProps> = ({ fallbackPath, isEditing }) => {
  const t = useTranslations("backButton");
  const router = useRouter();

  const handleBack = () => {
    if (fallbackPath && isEditing) {
      router.push(fallbackPath);
    } else {
      window.location.reload();
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="flex items-center gap-2 text-white border border-white h-10
                 rounded px-3 mx-4 py-1 transition-all duration-300
                 hover:bg-warning-light hover:text-info-dark hover:border-transparent bg-info-dark"
    >
      <FaArrowLeft /> {t("back")}
    </button>
  );
};

export default BackButton;
