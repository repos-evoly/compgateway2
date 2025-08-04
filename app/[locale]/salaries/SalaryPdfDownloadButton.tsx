"use client";

import React, { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import type { TSalaryTransaction } from "./types";
import { generateSalaryTransactionPdf } from "./generateSalaryPdf";
import { loadImageAsBase64 } from "../statement-of-account/loadImageAsBase64";

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

  const handleDownloadPdf = async () => {
    if (!transaction) return;
    setIsLoading(true);
    try {
      // Load the image from public/images/pdfbg.jpg
      const bgImageBase64 = await loadImageAsBase64("/images/pdfbg.jpg");
      generateSalaryTransactionPdf(transaction, bgImageBase64);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPdf}
      disabled={disabled || isLoading}
      className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
        disabled || isLoading
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-red-500 text-white hover:bg-red-600"
      }`}
      title={title || "Download PDF"}
    >
      <FaFilePdf className="text-xs" />
      {isLoading ? "Generating..." : "PDF"}
    </button>
  );
};

export default SalaryPdfDownloadButton;
