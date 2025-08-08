/* --------------------------------------------------------------------------
   app/[locale]/salaries/[cycleId]/components/SalaryCycleSummaryCard.tsx
   – Compact summary bar for salary cycle (view + edit).
   – No horizontal scrolling. Salary month is shown in the top bg-info-dark bar.
   – Dates show ONLY the date (no time). Strict TypeScript.
-------------------------------------------------------------------------- */
"use client";

import React, { JSX, useMemo } from "react";
import { useTranslations } from "next-intl";
import BackButton from "@/app/components/reusable/BackButton";
import InputSelectCombo, {
  type InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import { TSalaryTransaction } from "../types";
import {
  FiCreditCard,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

type Props = {
  mode: "view" | "edit";
  cycle: TSalaryTransaction;
  locale: string;
  salaryMonthInput?: string; // required in edit
  onSalaryMonthChange?: (value: string) => void; // required in edit
  accountOptions?: readonly InputSelectComboOption[]; // required in edit
  accLoading?: boolean;
};

type ChipProps = {
  icon: JSX.Element;
  label: string;
  value: string | JSX.Element;
  title?: string;
};

const StatChip = ({ icon, label, value, title }: ChipProps): JSX.Element => (
  <div
    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm"
    title={title}
  >
    <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 text-slate-700">
      {icon}
    </span>
    <div className="flex items-baseline gap-1">
      <span className="text-[11px] font-medium leading-none text-slate-500">
        {label}
      </span>
      <span className="text-sm font-semibold leading-none text-slate-800">
        {value}
      </span>
    </div>
  </div>
);

export default function SalaryCycleSummaryCard({
  mode,
  cycle,
  locale,
  salaryMonthInput,
  onSalaryMonthChange,
  accountOptions,
  accLoading = false,
}: Props): JSX.Element {
  const t = useTranslations("salaries");

  const salaryMonthDateOnly = useMemo(
    () => new Date(cycle.salaryMonth).toLocaleDateString(locale),
    [cycle.salaryMonth, locale]
  );
  const createdAtDateOnly = useMemo(
    () => new Date(cycle.createdAt).toLocaleDateString(locale),
    [cycle.createdAt, locale]
  );
  const postedAtDateOnly = useMemo(
    () =>
      cycle.postedAt
        ? new Date(cycle.postedAt).toLocaleDateString(locale)
        : "—",
    [cycle.postedAt, locale]
  );
  const totalStr = useMemo(
    () => `${cycle.totalAmount.toLocaleString()} ${cycle.currency}`,
    [cycle.totalAmount, cycle.currency]
  );

  if (mode === "view") {
    return (
      <div className="mb-2 rounded-xl bg-white ring-1 ring-slate-200">
        {/* Top bar with Back + Salary Month (date only) */}
        <div className="flex items-center justify-between gap-3 rounded-t-xl bg-info-dark px-3 py-2">
          <BackButton isEditing fallbackPath={`/${locale}/salaries`} />
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-white">
            <FiCalendar className="h-4 w-4" />
            <span className="text-sm font-medium">{t("salaryMonth")}</span>
            <span className="text-sm font-semibold">{salaryMonthDateOnly}</span>
          </div>
        </div>

        {/* Chips – no scroll; will wrap as needed */}
        <div className="px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatChip
              icon={<FiDollarSign className="h-3.5 w-3.5" />}
              label={t("totalAmount")}
              value={totalStr}
              title={t("totalAmount")}
            />
            <StatChip
              icon={<FiClock className="h-3.5 w-3.5" />}
              label={t("createdAt")}
              value={createdAtDateOnly}
              title={t("createdAt")}
            />
            <StatChip
              icon={<FiCreditCard className="h-3.5 w-3.5" />}
              label={t("debitAccount")}
              value={cycle.debitAccount}
              title={t("debitAccount")}
            />
            <StatChip
              icon={<FiCheckCircle className="h-3.5 w-3.5" />}
              label={t("postedAt")}
              value={postedAtDateOnly}
              title={t("postedAt")}
            />
          </div>
        </div>
      </div>
    );
  }

  // EDIT MODE
  return (
    <div className="mb-3 rounded-xl bg-white ring-1 ring-slate-200">
      {/* Top bar with Back + inline DATE INPUT */}
      <div className="flex items-center justify-between gap-3 rounded-t-xl bg-info-dark px-3 py-2">
        <BackButton isEditing fallbackPath={`/${locale}/salaries`} />
        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-white">
          <FiCalendar className="h-4 w-4" />
          <span className="text-sm font-medium">{t("salaryMonth")}</span>
          <input
            type="date"
            value={salaryMonthInput ?? ""}
            onChange={(e) => onSalaryMonthChange?.(e.target.value)}
            className="rounded border border-white/40 bg-white/90 px-2 py-0.5 text-sm text-slate-900 outline-none focus:border-white focus:ring-2 focus:ring-white/40"
          />
        </div>
      </div>

      {/* Chips / Controls – wrap as needed, no scroll */}
      <div className="px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatChip
            icon={<FiDollarSign className="h-3.5 w-3.5" />}
            label={t("totalAmount")}
            value={totalStr}
            title={t("totalAmount")}
          />
          <StatChip
            icon={<FiClock className="h-3.5 w-3.5" />}
            label={t("createdAt")}
            value={createdAtDateOnly}
            title={t("createdAt")}
          />
          {/* Debit account selector as a chip */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 text-slate-700">
              <FiCreditCard className="h-3.5 w-3.5" />
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium leading-none text-slate-500">
                {t("debitAccount")}
              </span>
              {accLoading ? (
                <span className="text-sm text-slate-600">Loading…</span>
              ) : (
                <div className="-mb-4">
                  <InputSelectCombo
                    name="debitAccount"
                    label=""
                    options={(accountOptions ?? []) as InputSelectComboOption[]}
                    placeholder={t("chooseAccount", {
                      defaultValue: "Choose account…",
                    })}
                    width="w-64"
                  />
                </div>
              )}
            </div>
          </div>
          <StatChip
            icon={<FiCheckCircle className="h-3.5 w-3.5" />}
            label={t("postedAt")}
            value={postedAtDateOnly}
            title={t("postedAt")}
          />
        </div>
      </div>
    </div>
  );
}
