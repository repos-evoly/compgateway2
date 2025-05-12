"use client";

import React from "react";
import CertifiedBankStatementForm from "./components/CertifiedBankStatementForm";

export default function CertifiedBankStatementPage() {
  return (
    <div className="flex items-center justify-center p-6">
      <div className=" w-full">
        <CertifiedBankStatementForm />
      </div>
    </div>
  );
}
