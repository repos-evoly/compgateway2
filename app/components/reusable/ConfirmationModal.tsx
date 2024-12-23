import React from "react";
import { useFormikContext } from "formik";
import { useTranslations } from "next-intl";
import { ConfirmationModalProps, InternalFormValues } from "@/types"; // Adjust path as necessary
import { FaPrint, FaTimes } from "react-icons/fa";
import SubmitButton from "@/app/components/FormUI/SubmitButton"; // Adjust path as necessary
import { FaCheck } from "react-icons/fa";

// Updated Metadata type with flexibility for additional data fields

const ConfirmationModal = <T extends Record<string, unknown>>({
  isOpen,
  onClose,
  metadata,
  additionalData,
}: ConfirmationModalProps<T>) => {
  const { values } = useFormikContext<InternalFormValues>();
  const t = useTranslations("confirmationModal");

  console.log("Values received in ConfirmationModal:", values);
  console.log("Additional data:", additionalData);

  if (!isOpen) return null;

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
          {/* Form Values */}
          {Object.keys(values as InternalFormValues).map((fieldName) => {
            const fieldMeta = metadata[fieldName] || {};
            const fieldType = fieldMeta.type || "text";
            const fieldLabel = fieldMeta.label || fieldName;

            return (
              <div key={fieldName} className="flex flex-col mb-4 last:mb-0">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {fieldLabel}
                </label>
                {fieldType === "checkbox" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!values[fieldName as keyof InternalFormValues]}
                      disabled
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span>
                      {values[fieldName as keyof InternalFormValues]
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>
                ) : fieldType === "select" || fieldType === "radio" ? (
                  <div className="p-2 border border-gray-300 rounded-md bg-gray-100">
                    {fieldMeta.options?.find(
                      (opt) =>
                        opt.value ===
                        values[fieldName as keyof InternalFormValues]
                    )?.label || "—"}
                  </div>
                ) : fieldType === "date" ? (
                  <div className="p-2 border border-gray-300 rounded-md bg-gray-100">
                    {values[fieldName as keyof InternalFormValues] || "—"}
                  </div>
                ) : fieldType === "multiselect" ? (
                  <div className="flex flex-wrap gap-2">
                    {(
                      values[fieldName as keyof InternalFormValues]
                        ?.toString()
                        .split(",") || []
                    ).map((selectedValue) => (
                      <span
                        key={selectedValue}
                        className="inline-block bg-gray-200 px-2 py-1 rounded"
                      >
                        {
                          fieldMeta.options?.find(
                            (opt) => opt.value.toString() === selectedValue
                          )?.label
                        }
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 border border-gray-300 rounded-md bg-gray-100">
                    {fieldMeta.value ||
                      values[fieldName as keyof InternalFormValues] ||
                      "—"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-center gap-4 mt-6 mb-4">
          <SubmitButton
            title={t("submit")}
            Icon={FaCheck}
            color="info-dark"
            fullWidth={false}
          />
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
};

export default ConfirmationModal;
