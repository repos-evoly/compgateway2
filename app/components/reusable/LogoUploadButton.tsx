"use client";

import React, { useState, useRef } from 'react';
import { FaUpload, FaImage, FaTrash } from 'react-icons/fa';

interface LogoUploadButtonProps {
  disabled?: boolean;
  title?: string;
  onLogoChange?: (logoData: string | null) => void;
}

const LogoUploadButton: React.FC<LogoUploadButtonProps> = ({
  disabled = false,
  title,
  onLogoChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          // Store in localStorage
          localStorage.setItem('pdfLogo', result);
          onLogoChange?.(result);
          // Show success message
          alert('Logo uploaded successfully! It will appear in the PDF header.');
          console.log('Logo stored in localStorage:', result.substring(0, 50) + '...');
        }
      };
      reader.readAsDataURL(file);
    } catch {
      alert('Failed to upload logo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.removeItem('pdfLogo');
    onLogoChange?.(null);
    alert('Logo removed successfully!');
  };

  const hasLogo = typeof window !== 'undefined' && localStorage.getItem('pdfLogo');

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={(e) => e.stopPropagation()}
        disabled={disabled || isLoading}
        className={`p-1 text-black hover:text-gray-700 transition-colors duration-200 ${
          disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={title || "Upload Logo"}
      >
        {hasLogo ? <FaImage size={18} /> : <FaUpload size={18} />}
        {isLoading && <span className="ml-1 text-xs">...</span>}
      </button>
      {hasLogo && (
        <button
          type="button"
          onClick={handleRemoveLogo}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={disabled}
          className="p-1 text-black hover:text-gray-700 transition-colors duration-200 !text-black"
          title="Remove Logo"
        >
          <FaTrash size={16} />
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />
    </div>
  );
};

export default LogoUploadButton; 