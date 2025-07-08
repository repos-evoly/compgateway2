"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { FiSmartphone } from "react-icons/fi";
import QRCodeDisplay from "@/app/auth/login/components/Qr"; // Adjust the path if needed
import AuthHeader from "@/app/auth/components/AuthHeader"; // Import the new header component

const QRPage = () => {
  const [login, setlogin] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve login from cookies
    const storedlogin = localStorage.getItem("auth_login");
    if (storedlogin) {
      setlogin(storedlogin);
      // Clear the cookie after retrieval for security
      document.cookie =
        "auth_login=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }, []);

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
        {login ? <QRCodeDisplay /> : <p>جاري تحميل البريد الإلكتروني...</p>}
      </div>
    </div>
  );
};

export default QRPage;
