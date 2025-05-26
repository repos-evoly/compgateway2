"use client";

import React, { useState } from "react";
import type { TKycResponse } from "./types";
import KycCodeForm from "./components/KycCodeForm";
import RegisterForm from "./components/RegisterForm";
import AuthHeader from "../components/AuthHeader";
import { FiUserPlus } from "react-icons/fi";

export default function RegisterPage() {
  const [kycData, setKycData] = useState<TKycResponse["data"] | null>(null);

  return (
    <div className="w-full">
      {/* Header on top */}
      <AuthHeader
        icon={<FiUserPlus />}
        title="التسجيل"
        subtitle="أدخل الرمز للمتابعة وإكمال عملية التسجيل"
      />

      {/* Container for the forms, with some top/bottom padding */}
      <div className="flex justify-center py-10">
        {kycData ? (
          <RegisterForm kycData={kycData} />
        ) : (
          <KycCodeForm onSuccess={(data) => setKycData(data)} />
        )}
      </div>
    </div>
  );
}
