"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { FaPrint, FaTimes, FaCheck, FaSpinner } from "react-icons/fa";

/** Optional type for each metadata object. Extend if needed. */
type FieldMetadata = {
  label?: string;
  // Add other properties if your metadata includes them
};

type ReusableConfirmationModalProps<T extends Record<string, unknown>> = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void; // We'll call this when user presses "Submit"
  /** If your metadata has different structure, adjust FieldMetadata as needed. */
  metadata: Record<string, FieldMetadata>;
  formData: T; // The data to display in the modal
  excludedFields?: string[];
  /** Currently unused in this component, but typed to avoid `any`. */
  additionalData?: Record<string, unknown>;
};

function ConfirmationModal<T extends Record<string, unknown>>({
  isOpen,
  onClose,
  onConfirm,
  metadata,
  formData,
  excludedFields = [],
}: ReusableConfirmationModalProps<T>) {
  const t = useTranslations("confirmationModal");

  // Local loading state for the "submit" button
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  /**
   * Called when user clicks "Submit" => set loading => run onConfirm => revert
   */
  const handleSubmitClick = async () => {
    if (!onConfirm) return; // if there's no callback, do nothing
    try {
      setIsSubmitting(true);
      // If onConfirm is async => await it
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white rounded shadow-md w-full max-w-xl max-h-[90vh] overflow-y-auto relative">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-700"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>

        {/* Modal Title */}
        <h2 className="text-xl font-bold text-center bg-info-dark text-white flex items-center justify-center py-4">
          {t("title")}
        </h2>

        {/* Scrollable Content */}
        <div className="p-6">
          {Object.keys(formData)
            .filter((fieldName) => !excludedFields.includes(fieldName))
            .map((fieldName) => {
              const fieldValue = formData[fieldName];
              const fieldMeta = metadata[fieldName] || {};
              const fieldLabel = fieldMeta.label || fieldName;

              return (
                <div key={fieldName} className="flex flex-col mb-4 last:mb-0">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    {fieldLabel}
                  </label>
                  <div className="p-2 border border-gray-300 rounded-md bg-gray-100">
                    {fieldValue !== undefined && fieldValue !== null
                      ? String(fieldValue)
                      : "—"}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-center gap-4 mt-6 mb-4">
          {/* "Confirm" button => calls onConfirm => shows spinner if isSubmitting */}
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition duration-300 bg-info-dark hover:bg-opacity-90 text-white ${
              isSubmitting ? "cursor-not-allowed opacity-90" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin h-5 w-5" />
                <span>{t("submitting")}</span>
              </>
            ) : (
              <>
                {t("submit")}
                <FaCheck className="h-5 w-5" />
              </>
            )}
          </button>

          {/* Print Button */}
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition duration-300 bg-warning-light hover:bg-opacity-90 text-white"
          >
            {t("print")}
            <FaPrint className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
