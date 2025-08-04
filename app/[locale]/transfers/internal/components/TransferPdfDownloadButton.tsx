"use client";

import React, { useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { generateTransferPdf } from '@/app/lib/generateTransferPdf';
import type { TransfersApiResponse } from '../types';
import LogoUploadButton from '@/app/components/reusable/LogoUploadButton';

interface TransferPdfDownloadButtonProps {
  transfer: TransfersApiResponse["data"][0];
  disabled?: boolean;
  title?: string;
}

const TransferPdfDownloadButton: React.FC<TransferPdfDownloadButtonProps> = ({
  transfer,
  disabled = false,
  title
}) => {
  const t = useTranslations('internalTransferForm');
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!transfer) return;
    setIsLoading(true);
    try {
      // Get logo data from localStorage
      const logoData = typeof window !== 'undefined' ? localStorage.getItem('pdfLogo') : null;
      console.log('Logo data retrieved:', logoData ? 'Found' : 'Not found');
      
      // Convert the transfer data to match the expected format
      const transferData = {
        id: transfer.id,
        categoryName: transfer.categoryName,
        fromAccount: transfer.fromAccount,
        toAccount: transfer.toAccount,
        amount: transfer.amount,
        status: transfer.status,
        requestedAt: transfer.requestedAt,
        currencyId: transfer.currencyCode,
        description: transfer.description,
        economicSectorId: transfer.packageName,
        logoData: logoData || undefined,
      };
      await generateTransferPdf(transferData);
    } catch {
      alert('Failed to generate PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <LogoUploadButton
        disabled={disabled}
        title={t('uploadLogo')}
      />
      <button
        type="button"
        onClick={handleDownloadPdf}
        onMouseDown={(e) => e.stopPropagation()}
        disabled={disabled || isLoading}
        className={`p-1 text-black hover:text-gray-700 transition-colors duration-200 ${
          disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={title || t('downloadPdf')}
      >
        <FaFilePdf size={18} />
        {isLoading && <span className="ml-1 text-xs">...</span>}
      </button>
    </div>
  );
};

export default TransferPdfDownloadButton; 