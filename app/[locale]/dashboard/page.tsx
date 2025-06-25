/* --------------------------------------------------------------------------
   app/[locale]/dashboard/page.tsx
   -------------------------------------------------------------------------- */
"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";

import { CheckAccount } from "@/app/helpers/checkAccount";
import type { AccountInfo } from "@/app/helpers/checkAccount";

import { getDashboardData } from "./services"; // adjust if moved
import type { Dashboard } from "./types";

import InfoBox from "./components/InfoBox";
import StatsBox from "./components/StatsBox";

/* Icons */
import {
  FiInfo,
  FiDollarSign,
  FiCreditCard,
  FiBarChart2,
  FiUsers,
  FiRepeat,
  FiPackage,
} from "react-icons/fi";
import { MdError } from "react-icons/md";

export default function DashboardPage() {
  /* ------------------------------------------------------------------ */
  /* Local state                                                         */
  /* ------------------------------------------------------------------ */
  const t = useTranslations("dashboard");
  const getCompanyCode = (): string | undefined => {
    const raw = Cookies.get("companyCode"); // → %22725119%22
    if (!raw) return undefined;
    return decodeURIComponent(raw).replace(/^"|"$/g, "");
  };

  const companyCode = getCompanyCode();
  const [accountData, setAccountData] = useState<AccountInfo[] | null>(null);
  const [stats, setStats] = useState<Dashboard | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  /* ------------------------------------------------------------------ */
  /* Fetch account list (CheckAccount helper)                            */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      if (!companyCode) return;
      try {
        const data = await CheckAccount(companyCode);
        setAccountData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoadingAccounts(false);
      }
    })();
  }, [companyCode]);

  /* ------------------------------------------------------------------ */
  /* Fetch dashboard stats                                               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      if (!companyCode) return;
      try {
        const data = await getDashboardData(companyCode);
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [companyCode]);

  /* ------------------------------------------------------------------ */
  /* Error / Loading states                                              */
  /* ------------------------------------------------------------------ */
  if (error) {
    return (
      <div className="p-3">
        <div className="bg-red-600 text-white p-3 rounded shadow-md">
          <div className="flex items-center mb-2">
            <MdError className="text-xl mr-2" />
            <p className="font-bold text-sm">{t("failedToFetchData")}</p>
          </div>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (loadingAccounts || loadingStats) {
    return (
      <div className="p-3">
        <div className="bg-info-dark text-white p-3 rounded shadow-md flex items-center">
          <FiInfo className="text-xl mr-2" />
          <p className="font-bold text-sm">{t("loading")}</p>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <div className="p-3">
      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              key: "transferVolume",
              label: t("transferVolume"),
              value: stats.transferVolume,
              Icon: FiDollarSign,
            },
            {
              key: "totalTransfers",
              label: t("totalTransfers"),
              value: stats.totalTransfers,
              Icon: FiRepeat,
            },
            {
              key: "userCount",
              label: t("userCount"),
              value: stats.userCount,
              Icon: FiUsers,
            },
            {
              key: "mostActiveSector",
              label: t("mostActiveSector"),
              value: stats.mostActiveSector,
              Icon: FiPackage,
            },
          ].map(({ key, label, value, Icon }) => (
            <StatsBox key={key} label={label} value={value} Icon={Icon} />
          ))}
        </div>
      )}

      {/* Accounts grid */}
      {accountData && accountData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
          {accountData.map((acc, index) => {
            /* choose an icon cyclically */
            const icons = [FiDollarSign, FiCreditCard, FiBarChart2];
            const BoxIcon = icons[index % icons.length];

            return (
              <InfoBox
                key={index}
                title={`حساب ${index + 1}`}
                icon={BoxIcon}
                accountString={acc.accountString}
                availableBalance={acc.availableBalance}
                debitBalance={acc.debitBalance}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-info-dark text-white p-3 rounded shadow-md flex items-center">
          <FiInfo className="text-xl mr-2" />
          <p className="font-bold text-sm">{t("noDataAvailable")}</p>
        </div>
      )}
    </div>
  );
}
