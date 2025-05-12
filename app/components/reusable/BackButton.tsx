import { useTranslations } from "next-intl";
import React from "react";
import { FaArrowLeft } from "react-icons/fa";

const BackButton = () => {
  const t = useTranslations("backButton");
  const handleBack = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };
  return (
    <button
      type="button"
      className="flex items-center gap-2 text-white border border-white rounded px-3 mx-4 py-1 transition-all duration-300 hover:bg-warning-light hover:text-info-dark hover:border-transparent "
      onClick={handleBack}
    >
      <FaArrowLeft /> {t("back")}
    </button>
  );
};

export default BackButton;
