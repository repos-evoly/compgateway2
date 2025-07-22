"use client";

import React, { useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { StatementLine } from './services';
import { generateStatementPdf } from './generatePdf';
import { loadImageAsBase64 } from './loadImageAsBase64';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!lines.length) return;
    setIsLoading(true);
    try {
      const fromDateFormatted = new Date(values.fromDate).toLocaleDateString('en-GB');
      const toDateFormatted = new Date(values.toDate).toLocaleDateString('en-GB');
      // Load the image from public/images/pdfbg.jpg
      const bgImageBase64 = await loadImageAsBase64('/images/pdfbg.jpg');
      generateStatementPdf(lines, {
        accountNumber: values.account,
        customerName: lines[0]?.nr1 || 'Customer Name',
        accountType: 'جاري',
        currency: 'دينار',
        branchAgency: '0015',
        timePeriod: `${fromDateFormatted} - ${toDateFormatted}`
      }, bgImageBase64);
    } catch (error) {
      alert('Failed to generate PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownloadPdf}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition duration-300 ${
        disabled || isLoading
          ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-white"
          : "border border-white bg-info-dark text-white hover:bg-warning-light hover:text-info-dark"
      }`}
      title={title}
    >
      <FaFilePdf className="h-5 w-5" />
      {isLoading && <span className="ml-2 text-xs">Loading...</span>}
    </button>
  );
};

export default PdfDownloadButton; 