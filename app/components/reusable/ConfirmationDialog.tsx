"use client";
import React from "react";
import { useTranslations } from "next-intl";

type ConfirmationDialogProps = {
  openDialog: boolean;
  message: string;
  onClose: (confirmed: boolean) => void;
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  openDialog,
  message,
  onClose,
}) => {
  const t = useTranslations("global");

  const handleClose = (confirmed: boolean) => {
    onClose(confirmed);
  };

  if (!openDialog) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {t("dialogTitle")}
          </h2>
        </div>
        <div className="p-4">
          <p className="text-gray-600">{message || t("delmessage")}</p>
        </div>
        <div className="flex justify-end gap-4 p-4 border-t">
          <button
            onClick={() => handleClose(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            {t("cancel")}
          </button>
          <button
            onClick={() => handleClose(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
