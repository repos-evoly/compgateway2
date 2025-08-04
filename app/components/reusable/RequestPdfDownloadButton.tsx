"use client";

import React, { useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import LogoUploadButton from './LogoUploadButton';
import { generateRequestPdf } from '@/app/lib/generateRequestPdf';

interface RequestPdfDownloadButtonProps {
  request: Record<string, unknown>;
  requestType: string;
  disabled?: boolean;
  title?: string;
}

const RequestPdfDownloadButton: React.FC<RequestPdfDownloadButtonProps> = ({
  request,
  requestType,
  disabled = false,
  title
}) => {
  const t = useTranslations('requests');
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!request) return;
    setIsLoading(true);
    try {
      // Generate PDF with the request data
      await generateRequestPdf(request, requestType);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <LogoUploadButton
        disabled={disabled}
        title={t('uploadLogo', { defaultValue: 'Upload Logo' })}
      />
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

export default RequestPdfDownloadButton; 