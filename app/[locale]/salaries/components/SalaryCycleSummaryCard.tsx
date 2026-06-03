
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
  const walletBatches = cycle.walletBatches ?? [];

  console.log("total amount ", cycle.totalAmount);

  if (mode === "view") {
    return (
      <div className="mb-2 rounded-xl bg-white ring-1 ring-slate-200">
        {/* Top bar with Back + Salary Month (date only) */}
        <div className="flex items-center justify-between gap-3 rounded-t-xl bg-info-dark px-3 py-2">
          <BackButton isEditing fallbackPath={`/${locale}/salaries`} />
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-white">
              <FiCalendar className="h-4 w-4" />
              <span className="text-sm font-medium">{t("salaryMonth")}</span>
              <span className="text-sm font-semibold">{cycle.salaryMonth}</span>
            </div>
            {cycle.additionalMonth && String(cycle.additionalMonth).trim().length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-white">
                <FiCalendar className="h-4 w-4" />
                <span className="text-sm font-medium">{t("additionalMonth")}</span>
                <span className="text-sm font-semibold">{String(cycle.additionalMonth)}</span>
              </div>
            )}
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
          {walletBatches.length > 0 && (
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
                {t("walletBatches")}
              </div>
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-start">{t("channel")}</th>
                    <th className="px-3 py-2 text-start">
                      {t("shadowAccount")}
                    </th>
                    <th className="px-3 py-2 text-start">{t("requested")}</th>
                    <th className="px-3 py-2 text-start">{t("successful")}</th>
                    <th className="px-3 py-2 text-start">{t("failed")}</th>
                    <th className="px-3 py-2 text-start">{t("reversal")}</th>
                    <th className="px-3 py-2 text-start">{t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {walletBatches.map((batch) => (
                    <tr key={batch.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium">
                        {batch.walletChannel === "evo"
                          ? t("paymentChannelEvo")
                          : t("paymentChannelBcd")}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {batch.shadowAccount}
                      </td>
                      <td className="px-3 py-2">
                        {batch.requestedTotalAmount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        {batch.successfulTotalAmount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        {batch.failedTotalAmount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        {batch.reversalStatus}
                        {batch.reversalAmount > 0
                          ? ` (${batch.reversalAmount.toLocaleString()})`
                          : ""}
                      </td>
                      <td className="px-3 py-2">{batch.overallStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
