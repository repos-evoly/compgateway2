"use client";

import React from "react";
import BackButton, { type BackButtonProps } from "./BackButton";
import StatusBanner from "./StatusBanner";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */
export type FormHeaderProps = BackButtonProps & {
  /** Title text shown next to the Back button */
  text?: string;
  /** Extra content (typically buttons or switches) rendered after the title */
  children?: React.ReactNode;
  /** Force-show or hide the Back button; otherwise auto-detects */
  showBackButton?: boolean;
  className?: string;
  /** Makes the header sticky at the top of the scroll container */
  isFixedOnScroll?: boolean;
  /** Optional status badge text (any string). Always appears at the row’s end
   *  (right in LTR, left in RTL) without affecting the Back button. */
  status?: string;
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const FormHeader: React.FC<FormHeaderProps> = ({
  text,
  children,
  className = "",
  isFixedOnScroll = false,
  showBackButton,
  fallbackPath,
  isEditing,
  status,
  ...restBackButtonProps
}) => {
  /* ---------------- logic ---------------- */
  const displayBackButton =
    showBackButton ?? (Boolean(fallbackPath) || Boolean(isEditing));

  const hasLeftContent = displayBackButton || Boolean(text);

  /* ---------------- render ---------------- */
  return (
    <div
      className={`flex items-center bg-info-dark text-white p-4 rounded-md
        ${isFixedOnScroll ? "sticky top-0 z-50" : ""}
        ${className}`}
    >
      {/* ---------- Left side (Back + title) ---------- */}
      {hasLeftContent && (
        <div className="flex items-center gap-2">
          {displayBackButton && (
            <BackButton
              fallbackPath={fallbackPath}
              isEditing={isEditing}
              {...restBackButtonProps}
            />
          )}
          {text && <h2 className="text-lg font-semibold">{text}</h2>}
        </div>
      )}

      {/* ---------- Middle controls ---------- */}
      {children}

      {/* ---------- Status badge (always row-end) ---------- */}
      {status && (
        <StatusBanner status={status} className="ltr:ml-auto rtl:mr-auto" />
      )}
    </div>
  );
};

export default FormHeader;
