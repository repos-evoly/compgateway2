"use client";

import React, { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { generateRequestPdf } from "@/app/lib/generateRequestPdf";

/* ─── per-type “get by ID” helpers ─── */
import { getVisaRequestById } from "@/app/[locale]/requests/visaRequest/services";
import { getCheckbookRequestById } from "@/app/[locale]/requests/checkbook/services";
import { getCheckRequestById } from "@/app/[locale]/requests/checkRequest/services";
import { getCreditFacilityById } from "@/app/[locale]/requests/creditFacility/services";
import { getLetterOfGuaranteeById } from "@/app/[locale]/requests/letterOfGuarantee/services";
import { getCertifiedBankStatementById } from "@/app/[locale]/requests/certifiedBankStatement/services";
import { getRtgsRequestById } from "@/app/[locale]/requests/rtgs/services";
// import { getForeignTransferById } from "@/app/[locale]/requests/foreignTransfers/services";
import { getCblRequestById } from "@/app/[locale]/requests/cbl/service";


/* ---------- shared types ---------- */
type FetcherFn = (id: number) => Promise<Record<string, unknown>>;

/* ---------- lookup table ---------- */
const fetcherMap: Record<string, FetcherFn> = {
  visa: getVisaRequestById,
  checkbook: getCheckbookRequestById,
  checkrequest: getCheckRequestById,
  creditfacility: getCreditFacilityById,
  letterofguarantee: getLetterOfGuaranteeById,
  certifiedbankstatement: getCertifiedBankStatementById,
  rtgs: getRtgsRequestById,
  // foreigntransfer: getForeignTransferById,
  cbl: getCblRequestById,
};

interface RequestPdfDownloadButtonProps {
  /** e.g. "visa", "checkbook", "certifiedBankStatement", etc.  */
  requestType: string;
  /** primary key of the request row to fetch */
  requestId: number;
  disabled?: boolean;
  title?: string;
}

/* ──────────────────────────────────────────────────────────────── */
const RequestPdfDownloadButton: React.FC<RequestPdfDownloadButtonProps> = ({
  requestType,
  requestId,
  disabled = false,
  title,
}) => {
  const t = useTranslations("requests");
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      /* 1️⃣ normalise & pick the fetcher */
      const key = requestType.toLowerCase().replace(/\s+/g, "");
      const fetcher = fetcherMap[key];
      if (!fetcher)
        throw new Error(`No fetcher for request type: ${requestType}`);

      /* 2️⃣ fetch full record */
      const fullRequest = await fetcher(requestId);
      console.log("Full request data:", fullRequest);

      /* 3️⃣ generate PDF */
      await generateRequestPdf(fullRequest, requestType);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownloadPdf}
      onMouseDown={(e) => e.stopPropagation()}
      disabled={disabled || isLoading}
      className={`flex items-center gap-1 p-1 text-black hover:text-gray-700 transition-colors duration-200 ${
        disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title={title || t("downloadPdf", { defaultValue: "Download PDF" })}
    >
      <FaFilePdf size={18} />
      {isLoading && <span className="ml-1 text-xs">...</span>}
    </button>
  );
};

export default RequestPdfDownloadButton;
