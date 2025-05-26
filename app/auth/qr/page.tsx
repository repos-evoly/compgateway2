import React from "react";
import { FiSmartphone } from "react-icons/fi";
import QRCodeDisplay from "@/app/auth/login/components/Qr"; // Adjust the path if needed
import AuthHeader from "@/app/auth/components/AuthHeader"; // Import the new header component

const QRPage = () => {
  return (
    <div className="w-full flex flex-col items-center bg-gray-100 min-h-screen">
      {/* Auth Header with QR Icon, Title, and Subtitle */}
      <AuthHeader
        icon={<FiSmartphone />}
        title="رمز الاستجابة السريعة"
        subtitle="امسح رمز QR للوصول إلى معلوماتك"
      />

      {/* QR Code Display */}
      <div className="flex-grow flex items-center justify-center">
        <QRCodeDisplay qrImagePath="/images/qr-code.png" />
      </div>
    </div>
  );
};

export default QRPage;
