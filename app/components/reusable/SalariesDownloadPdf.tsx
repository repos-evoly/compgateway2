"use client";

import React, { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { useTranslations } from "next-intl";

import { generateSalaryTransactionPdf } from "@/app/lib/generateSalaryPdf";
import { getSalaryCycleById } from "@/app/[locale]/salaries/services";
import type { TSalaryTransaction } from "@/app/[locale]/salaries/types";

interface SalaryPdfDownloadButtonProps {
  transaction: TSalaryTransaction;
  disabled?: boolean;
  title?: string;
}

const SalaryPdfDownloadButton: React.FC<SalaryPdfDownloadButtonProps> = ({
  transaction,
  disabled = false,
  title,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("requests");

  const handleDownloadPdf = async () => {
    if (!transaction) return;
    setIsLoading(true);

    try {
      console.log("[Salary PDF] Requested from row:", transaction);

      // Always try to fetch the freshest cycle details before printing
      let data: TSalaryTransaction = transaction;
      try {
        const fresh = await getSalaryCycleById(transaction.id);
        console.log("[Salary PDF] Fetched by ID for PDF:", fresh);
        data = fresh;
      } catch (fetchErr) {
        console.warn(
          "[Salary PDF] getSalaryCycleById failed; falling back to row data:",
          fetchErr
        );
      }

      generateSalaryTransactionPdf(data);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleDownloadPdf}
        onMouseDown={(e) => e.stopPropagation()}
        disabled={disabled || isLoading}
        className={`p-1 text-black hover:text-gray-700 transition-colors duration-200 ${
          disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title={title || t("downloadPdf", { defaultValue: "Download PDF" })}
      >
        <FaFilePdf size={18} />
        {isLoading && <span className="ml-1 text-xs">...</span>}
      </button>
    </div>
  );
};

export default SalaryPdfDownloadButton;
