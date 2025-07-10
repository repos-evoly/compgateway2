"use client";

import React, { JSX } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export type BackButtonProps = {
  /** Optional path to navigate to instead of router.back() */
  fallbackPath?: string;
  /** Whether the parent wizard is in editing mode (kept for future use) */
  isEditing?: boolean;
  /** Custom label text; defaults to the i18n “back” string */
  label?: string;
  /** Tailwind (or other) classes to fully override the default design */
  className?: string;
};

const BackButton = ({
  fallbackPath,
  label,
  className,
}: BackButtonProps): JSX.Element => {
  const t = useTranslations("backButton");
  const router = useRouter();

  const handleBack = (): void => {
    if (fallbackPath) {
      router.push(fallbackPath);
    } else {
      router.back();
    }
  };

  const defaultClasses =
    "flex items-center gap-2 text-white border border-white h-10 rounded px-3 mx-4 py-1 transition-all duration-300 hover:bg-warning-light hover:text-info-dark hover:border-transparent bg-info-dark";

  /* Use custom classes exclusively if provided, otherwise fall back to defaults */
  const appliedClasses =
    className && className.trim().length > 0 ? className : defaultClasses;

  return (
    <button type="button" onClick={handleBack} className={appliedClasses}>
      <FaArrowLeft />
      {label ?? t("back")}
    </button>
  );
};

export default BackButton;
