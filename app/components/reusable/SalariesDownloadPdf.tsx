"use client";

import React, { useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { generateSalaryTransactionPdf } from '@/app/lib/generateSalaryPdf';
import { TSalaryTransaction } from '@/app/[locale]/salaries/types';
import { loadImageAsBase64 } from '@/app/[locale]/statement-of-account/loadImageAsBase64';
import { useTranslations } from 'next-intl';

// Define the props for the SalariesDownloadPdf component   

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
  const t = useTranslations('requests');
  

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
    <div className="flex items-center gap-1">
      
      <button
        type="button"
        onClick={handleDownloadPdf}
        onMouseDown={(e) => e.stopPropagation()}
        disabled={disabled || isLoading}
        className={`p-1 text-black hover:text-gray-700 transition-colors duration-200 ${
          disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={title || t('downloadPdf', { defaultValue: 'Download PDF' })}
      >
        <FaFilePdf size={18} />
        {isLoading && <span className="ml-1 text-xs">...</span>}
      </button>
    </div>
  );
};

export default SalaryPdfDownloadButton; 
