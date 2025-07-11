/* --------------------------------------------------------------------------
   app/profile/page.tsx              – logged-in company profile page
   -------------------------------------------------------------------------- */
"use client";

import React, { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import { FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";

import CompanyNotFound from "@/app/[locale]/profile/components/CompanyNotFound";
import HeaderSection from "@/app/[locale]/profile/components/HeaderSection";
import ContactLocationSection from "@/app/[locale]/profile/components/ContactLocationSection";
// import KycTimelineSection from "@/app/[locale]/profile/components/KycTimelineSection";
import DocumentsSection from "@/app/[locale]/profile/components/DocumentSection";

import { Company } from "@/app/[locale]/profile/types";
import { getCompannyInfoByCode } from "@/app/[locale]/profile/services";
import LoadingPage from "@/app/components/reusable/Loading";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import ContactSupportSection from "./components/ContactSupportSection";

/* -------------------------------------------------------------------------- */

export default function ProfilePage(): JSX.Element {
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* ─ Fetch company once cookie is available ─ */
  useEffect(() => {
    const raw = Cookies.get("companyCode") ?? "";
    const code = raw.replace(/^"|"$/g, ""); // strip any surrounding quotes

    if (!code) {
      setError("No company code found in cookies.");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const fetched = await getCompannyInfoByCode(code);
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

  /* ─ UI helpers ─ */
  const statusBadge = (status: string) => {
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

  const activeBadge = (isActive: boolean) =>
    isActive ? (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-green-50 text-info-dark border border-green-200">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> Inactive
      </span>
    );

  /* ────────────────────────────────────────────────────────────────────── */
  if (loading) {
    return <LoadingPage />;
  }

  if (error || !company) {
    return <CompanyNotFound onBack={() => router.push("/dashboard")} />;
  }

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <HeaderSection
        company={company}
        getStatusBadge={statusBadge}
        getActiveBadge={activeBadge}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contact section on its own line */}
          <ContactLocationSection company={company} />

          {/* KYC timeline on its own line */}
          {/* <KycTimelineSection company={company} /> */}
          <ContactSupportSection />
        </div>

        {/* RIGHT */}
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
