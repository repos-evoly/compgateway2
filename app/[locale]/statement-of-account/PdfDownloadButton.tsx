"use client";

import React, { useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { StatementLine } from './services';
import { generateStatementPdf } from './generatePdf';
import { loadImageAsBase64 } from './loadImageAsBase64';
import { useLocale } from 'next-intl';

interface PdfDownloadButtonProps {
  lines: StatementLine[];
  disabled: boolean;
  values: {
    account: string;
    fromDate: string;
    toDate: string;
  };
  title?: string;
}

const PdfDownloadButton: React.FC<PdfDownloadButtonProps> = ({
  lines,
  disabled,
  values,
  title
}) => {
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!lines.length) return;
    setIsLoading(true);
    try {
      const fromDateFormatted = new Date(values.fromDate).toLocaleDateString('en-GB');
      const toDateFormatted = new Date(values.toDate).toLocaleDateString('en-GB');
      // Load the image from public/images/pdfbg.jpg
      const bgImageBase64 = await loadImageAsBase64('/Companygw/images/pdfbg.jpg');
      generateStatementPdf(lines, {
        accountNumber: values.account,
        customerName: lines[0]?.nr1 || 'Customer Name',
        accountType: 'جاري',
        currency: 'دينار',
        branchAgency: '0015',
        timePeriod: `${fromDateFormatted} - ${toDateFormatted}`
      }, bgImageBase64);
    } catch {
      alert('Failed to generate PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = disabled || isLoading;
  const isRtl = locale === 'ar';

  return (
    <div
      className={`relative inline-flex ${isButtonDisabled ? "group" : ""} ${
        isRtl ? 'rtl' : 'ltr'
      }`}
      aria-disabled={isButtonDisabled}
    >
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={isButtonDisabled}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition duration-300 ${
          isButtonDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-white"
            : "border border-white bg-info-dark text-white hover:bg-warning-light hover:text-info-dark"
        }`}
        title={!isButtonDisabled ? title : undefined}
      >
        <FaFilePdf className="h-5 w-5" />
        {isLoading && <span className="ml-2 text-xs">Loading...</span>}
      </button>
      {isButtonDisabled && (
        <>
          <span
            className="absolute inset-0"
            style={{ pointerEvents: "auto" }}
          />
          <div
            className={`pointer-events-none absolute top-full mt-1 w-[180px] whitespace-normal break-words rounded border border-gray-300 bg-white px-2 py-0.5 text-[10px] leading-tight text-gray-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-75 ${
              isRtl ? 'left-0 text-right' : 'right-0'
            }`}
            role="tooltip"
          >
            {title}
          </div>
        </>
      )}
    </div>
  );
};

export default PdfDownloadButton; 
