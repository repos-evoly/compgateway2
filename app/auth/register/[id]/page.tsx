"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import RegisterForm from "../components/RegisterForm";
import { getCompanyRegistrationInfoByCode, editCompanyInfo } from "../services";
import type { TCompanyRegistrationInfo, TKycResponse } from "../types";

// Import the new reusable component
import StatusMessage from "../components/StatusMessage";

export default function SingleCompanyRegisterPage() {
  const searchParams = useSearchParams();

  // Read query param "msg"
  const statusMessage = searchParams.get("msg") || "";

  // Example: Hardcode the code, or read from `[companyCode]` param
  const [companyCode] = useState("725119");

  // Retrieve userId from cookies (on the client)
  const userId = Cookies.get("userId") || "";

  const [companyInfo, setCompanyInfo] =
    useState<TCompanyRegistrationInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Fetch data once on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCompanyRegistrationInfoByCode(companyCode);
        setCompanyInfo(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [companyCode]);

  // Loading / Error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!companyInfo) return <div>No company info found</div>;

  console.log("Company Registration Info Response:", companyInfo);

  // Build kycData from the response
  const kycData: TKycResponse["data"] = {
    companyId: companyInfo.code,
    branchId: companyInfo.kycBranchId ?? "",
    legalCompanyName: companyInfo.kycLegalCompanyName ?? "",
    legalCompanyNameLT: companyInfo.kycLegalCompanyNameLt ?? "",
    mobile: companyInfo.kycMobile ?? "",
    nationality: companyInfo.kycNationality ?? "",
    nationalityEN: "",
    nationalityCode: "",
    street: null,
    district: null,
    buildingNumber: null,
    city: companyInfo.kycCity ?? "",
  };

  // Pre-fill from adminContact
  const initialValues = {
    firstName: companyInfo.adminContact.firstName,
    lastName: companyInfo.adminContact.lastName,
    phone: companyInfo.adminContact.phone,
  };

  // Handle form submit => call "editCompanyInfo"
  const handleSubmit = async (values: {
    firstName: string;
    lastName: string;
    phone: string;
    companyCode: string;
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      console.log("Submitted form values:", values);

      // We only care about firstName, lastName, phone for updating
      await editCompanyInfo(userId, {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
      });

      alert("تم تحديث البيانات بنجاح");
      // Optionally, navigate after success
      // router.push('/somewhere');
    } catch (err) {
      console.error("Failed to edit company info:", err);
      alert("خطأ أثناء تحديث البيانات");
    }
  };

  return (
    <div className="m-auto">
      {/* If we have a status message, display the new reusable component */}
      {statusMessage && <StatusMessage message={statusMessage} />}

      <RegisterForm
        kycData={kycData}
        onSubmit={handleSubmit}
        showLimitedFields
        initialValues={initialValues}
        submitButtonLabel="تحديث البيانات"
      />
    </div>
  );
}
