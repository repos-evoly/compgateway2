"use client";
import React from "react";
import Image from "next/image";

interface QRCodeDisplayProps {
  qrImagePath: string; // Path to the QR code image
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrImagePath }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white shadow-lg rounded-lg border border-gray-200 w-64">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">امسح رمز QR</h2>
      <div className="w-48 h-48 relative">
        <Image
          src={qrImagePath}
          alt="QR Code"
          layout="fill"
          objectFit="contain"
          className="rounded-lg border border-gray-300"
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">استخدم هاتفك لمسح هذا الرمز</p>
    </div>
  );
};

export default QRCodeDisplay;
