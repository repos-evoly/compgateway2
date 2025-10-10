/* --------------------------------------------------------------------------
   app/[locale]/dashboard/page.tsx
   -------------------------------------------------------------------------- */
"use client";

import React, { JSX, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";

import { CheckAccount } from "@/app/helpers/checkAccount";
import type { AccountInfo } from "@/app/helpers/checkAccount";

import { getDashboardData } from "./services";
import type { Dashboard } from "./types";

import InfoBox from "./components/InfoBox";
import StatsBox from "./components/StatsBox";

import {
  FiInfo,
  FiCreditCard,
  FiBarChart2,
  FiUsers,
  FiRepeat,
  FiPackage,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { FaMoneyBillWave } from "react-icons/fa";
import type { IconType } from "react-icons";

import LoadingPage from "@/app/components/reusable/Loading";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

/* ────────────────────────────────────────────────────────────────────────────
 * Constants & helpers
 * ────────────────────────────────────────────────────────────────────────── */
const INITIAL_VISIBLE = 3;

const getCompanyCode = (): string | undefined => {
  const raw = Cookies.get("companyCode");
  if (!raw) return undefined;
  return decodeURIComponent(raw).replace(/^"|"$/g, "");
};

/* ────────────────────────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────────────────────── */
export default function DashboardPage(): JSX.Element {
  const t = useTranslations("dashboard");
  const companyCode = getCompanyCode();

  /* ----------------------------- state ----------------------------- */
  const [accountData, setAccountData] = useState<AccountInfo[] | null>(null);
  const [stats, setStats] = useState<Dashboard | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE);

  /* --------------------------- fetch accounts ---------------------- */
  useEffect(() => {
    if (!companyCode) return;

    (async () => {
      try {
        const data = await CheckAccount(companyCode);
        setAccountData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        setErrorModalOpen(true);
      } finally {
        setLoadingAccounts(false);
      }
    })();
  }, [companyCode]);

  /* ----------------------------- fetch stats ----------------------- */
  useEffect(() => {
    if (!companyCode) return;

    (async () => {
      try {
        const data = await getDashboardData(companyCode);
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        setErrorModalOpen(true);
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [companyCode]);

  /* ----------------------- loading / error UI ---------------------- */
  if (loadingAccounts || loadingStats) {
    return <LoadingPage />;
  }

  const closeErrorModal = () => {
    setErrorModalOpen(false);
    setError(null);
  };

  /* ------------------------- icon arrays --------------------------- */
  const balanceIcons: IconType[] = [FaMoneyBillWave, FiCreditCard, FiBarChart2];

  const statsConfig: {
    key: string;
    label: string;
    value: string | number;
    Icon: IconType;
  }[] = [
    {
      key: "transferVolume",
      label: t("transferVolume"),
      value: stats?.transferVolume ?? 0,
      Icon: FaMoneyBillWave,
    },
    {
      key: "totalTransfers",
      label: t("totalTransfers"),
      value: stats?.totalTransfers ?? 0,
      Icon: FiRepeat,
    },
    {
      key: "userCount",
      label: t("userCount"),
      value: stats?.userCount ?? 0,
      Icon: FiUsers,
    },
    {
      key: "mostActiveSector",
      label: t("mostActiveSector"),
      value: stats?.mostActiveSector ?? "-",
      Icon: FiPackage,
    },
  ];

  /* -------------------------- render ------------------------------- */
  return (
    <div className="p-3">
      <ErrorOrSuccessModal
        isOpen={errorModalOpen && Boolean(error)}
        isSuccess={false}
        title={t("failedToFetchData")}
        message={error ?? ""}
        onClose={closeErrorModal}
        okLabel="حسناً"
      />
      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map(({ key, label, value, Icon }) => (
            <StatsBox key={key} label={label} value={value} Icon={Icon} />
          ))}
        </div>
      )}

      {/* Accounts */}
      {accountData && accountData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {accountData.slice(0, visibleCount).map((acc, index) => {
              const BoxIcon = balanceIcons[index % balanceIcons.length];
              return (
                <InfoBox
                  key={acc.accountString}
                  title={`حساب ${index + 1}`}
                  icon={BoxIcon}
                  accountString={acc.accountString}
                  availableBalance={acc.availableBalance}
                  debitBalance={acc.debitBalance}
                />
              );
            })}
          </div>

          {/* Controls */}
          <div className="mt-4 flex justify-center gap-4">
            {visibleCount < accountData.length && (
              <button
                type="button"
                aria-label={t("showMore")}
                className="rounded-full bg-info-dark p-2 text-white shadow hover:bg-info-dark/90"
                onClick={() =>
                  setVisibleCount((prev) =>
                    Math.min(prev + 3, accountData.length)
                  )
                }
              >
                <FiPlus className="text-lg" />
              </button>
            )}

            {visibleCount > INITIAL_VISIBLE && (
              <button
                type="button"
                aria-label={t("showLess")}
                className="rounded-full bg-info-dark p-2 text-white shadow hover:bg-info-dark/90"
                onClick={() =>
                  setVisibleCount((prev) => Math.max(prev - 3, INITIAL_VISIBLE))
                }
              >
                <FiMinus className="text-lg" />
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center rounded bg-info-dark p-3 text-white shadow-md">
          <FiInfo className="mr-2 text-xl" />
          <p className="text-sm font-bold">{t("noDataAvailable")}</p>
        </div>
      )}
    </div>
  );
}
