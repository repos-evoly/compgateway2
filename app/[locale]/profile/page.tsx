/* --------------------------------------------------------------------------
   app/[locale]/profile/page.tsx – logged-in company profile page (front-end)
   -------------------------------------------------------------------------- */
"use client";

import React, { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Cookies from "js-cookie";
import { FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";

import CompanyNotFound from "@/app/[locale]/profile/components/CompanyNotFound";
import HeaderSection from "@/app/[locale]/profile/components/HeaderSection";
import ContactLocationSection from "@/app/[locale]/profile/components/ContactLocationSection";
import DocumentsSection from "@/app/[locale]/profile/components/DocumentSection";
import ContactSupportSection from "./components/ContactSupportSection";
import LoadingPage from "@/app/components/reusable/Loading";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import { buildImageProxyUrl } from "@/app/utils/imageProxy";

import type { Company } from "@/app/[locale]/profile/types";
import { getCompannyInfoByCode } from "@/app/[locale]/profile/services";

/* ---------------------------------------------------------------------- */
export default function ProfilePage(): JSX.Element {
  const router = useRouter();
  const locale = useLocale();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoId, setLogoId] = useState<string>();

  /* ----- fetch company ------------------------------------------------- */
  useEffect(() => {
    const raw = Cookies.get("companyCode") ?? "";
    const code = raw.replace(/^"|"$/g, "");
    if (!code) {
      setError("No company code found in cookies.");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const fetched = await getCompannyInfoByCode(code);
        const logoAttachment = fetched.attachments?.find(
          (a) => a.attSubject?.toLowerCase() === "logo"
        );
        const fullLogoUrl = logoAttachment
          ? buildImageProxyUrl(logoAttachment.attUrl)
          : null;
        setLogoUrl(fullLogoUrl);
        setLogoId(logoAttachment?.id);
        setCompany(fetched);
        setError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Company not found";
        setModalTitle("Fetch Error");
        setModalMessage(msg);
        setModalSuccess(false);
        setModalOpen(true);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ----- UI helpers ---------------------------------------------------- */
  const statusBadge = (status: string): JSX.Element => {
    const s = status.toLowerCase();
    const missing =
      s === "missingsdocuments" ||
      s === "missingkyc" ||
      s === "missinginformation";

    if (s === "approved" || s === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-info-dark border border-emerald-200">
          <FiCheckCircle className="text-xs" />
          {s === "active" ? "Active" : "Approved"}
        </span>
      );
    }
    if (s === "underreview") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <FiAlertCircle className="text-xs" />
          Under Review
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          <FiXCircle className="text-xs" />
          Rejected
        </span>
      );
    }
    if (missing) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
          Missing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
        {status}
      </span>
    );
  };

  /* ----- render -------------------------------------------------------- */
  if (loading) return <LoadingPage />;
  if (error || !company)
    return (
      <CompanyNotFound onBack={() => router.push(`/${locale}/dashboard`)} />
    );

  return (
    <div className="bg-gray-50">
      {/* header with inline logo uploader */}
      <HeaderSection
        company={company}
        getStatusBadge={statusBadge}
        initialLogoUrl={logoUrl}
        logoId={logoId}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT ---------------------------------------------------------- */}
        <div className="lg:col-span-2 space-y-8">
          <ContactLocationSection company={company} />
          {/* <KycTimelineSection company={company} /> */}
          <ContactSupportSection />
        </div>

        {/* RIGHT --------------------------------------------------------- */}
        <div className="lg:col-span-1">
          <DocumentsSection documents={company.attachments ?? []} />
        </div>
      </div>

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
      />
    </div>
  );
}
