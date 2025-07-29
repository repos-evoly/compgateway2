"use client";

import React, { useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { generateTransferPdf } from '@/app/lib/generateTransferPdf';
import type { TransfersApiResponse } from '../types';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!transfer) return;
    setIsLoading(true);
    try {
      // Handle group transfers stored as single records with comma-separated accounts
      let toAccounts: string | string[] = transfer.toAccount;
      
      // Check if this is a group transfer (has comma-separated accounts or is marked as group transfer)
      if (typeof transfer.toAccount === 'string' && transfer.toAccount.includes(',')) {
        // Split comma-separated accounts into array
        toAccounts = transfer.toAccount.split(',').map(acc => acc.trim());
      }

      // Convert the transfer data to match the expected format
      const transferData = {
        id: transfer.id,
        categoryName: transfer.categoryName,
        fromAccount: transfer.fromAccount,
        toAccount: toAccounts,
        amount: transfer.amount,
        status: transfer.status,
        requestedAt: transfer.requestedAt,
        currencyId: transfer.currencyCode,
        description: transfer.description,
        economicSectorId: transfer.packageName,
      };
      generateTransferPdf(transferData);
    } catch {
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
      className={`p-1 text-black hover:text-gray-700 transition-colors duration-200 ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={title || "Download PDF"}
    >
      <FaFilePdf size={18} />
      {isLoading && <span className="ml-1 text-xs">...</span>}
    </button>
  );
};

export default TransferPdfDownloadButton; 