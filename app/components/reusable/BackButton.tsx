/* --------------------------------------------------------------------------
 * BackButton.tsx – v4
 * • Re-adds the original “refresh when !isEditing” behaviour
 * • Keeps all newer customisations (label, className, onBack, etc.)
 * ----------------------------------------------------------------------- */

"use client";

import React, { JSX } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export type BackButtonProps = {
  /** Optional path to navigate to instead of router.back() */
  fallbackPath?: string;
  /** Custom label text; defaults to the i18n "back" string */
  label?: string;
  /** Tailwind (or other) classes to fully override the default design */
  className?: string;
  /** Custom back handler function (overrides everything else) */
  onBack?: () => void;
  /** True if the surrounding form/page is in “edit” mode */
  isEditing?: boolean;
};

const BackButton = ({
  fallbackPath,
  label,
  className,
  onBack,
  isEditing,
}: BackButtonProps): JSX.Element => {
  const t = useTranslations("backButton");
  const router = useRouter();

  const handleBack = (): void => {
    /* 1️⃣ Caller-supplied handler wins */
    if (onBack) {
      onBack();
      return;
    }

    /* 2️⃣ If we’re editing AND a fallback is provided → go there */
    if (isEditing && fallbackPath) {
      router.push(fallbackPath);
      return;
    }

    /* 3️⃣ Not editing (or no fallback) → refresh page like legacy comp */
    if (!isEditing) {
      window.location.reload();
      return;
    }

    /* 4️⃣ Fallback to history back */
    router.back();
  };

  /* ------------------------------------------------------------------ */
  /* Styling                                                             */
  /* ------------------------------------------------------------------ */
  const defaultClasses =
    "flex items-center gap-2 text-white border border-white h-10 rounded px-3 mx-4 py-1 transition-all duration-300 hover:bg-warning-light hover:text-info-dark hover:border-transparent bg-info-dark";

  const appliedClasses =
    className && className.trim().length > 0 ? className : defaultClasses;

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <button type="button" onClick={handleBack} className={appliedClasses}>
      <FaArrowLeft />
      {label ?? t("back")}
    </button>
  );
};

export default BackButton;
