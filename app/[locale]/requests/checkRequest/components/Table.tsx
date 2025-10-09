/* --------------------------------------------------------------------------
   app/[locale]/requests/checkRequest/components/Table.tsx
   – Client component
   – Row 1 (Amount): user enters values.
   – Row 2 (Expenses): 
       • Dirham *  = fixed **10** (always)
       • D.L *     = 
           - If Amount_LYD < 10,000 ⇒ fixed **10** D.L*
           - Else ⇒ (Amount_LYD + Amount_Dirham/1000) × (2/1000)
         (i.e., 1 د.ل* = 1000 درهم*)
   – Row 3 (Total):
       • Dirham *  = Amount_Dirham + 10
       • D.L *     = Amount_LYD + computed commission
   – Computation happens via Formik watchers; fields are disabled for rows 2 & 3.
   – Strict TypeScript (no `any`), copy-paste ready.
-------------------------------------------------------------------------- */
"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useFormikContext } from "formik";
import { FaMoneyBillWave, FaCalculator } from "react-icons/fa";

import FormInputIcon from "@/app/components/FormUI/FormInputIcon";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type LineItem = {
  dirham: number | string | "";
  lyd: number | string | "";
};

type FormShape = {
  lineItems: [LineItem, LineItem, LineItem]; // [Amount, Expenses, Total]
};

type TCheckRequestTableProps = {
  /** If true, inputs are disabled (row 1 only). Row 2 & 3 are always disabled. */
  readOnly?: boolean;
};

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const FIXED_DIRHAM_EXPENSE = 10; // Row 2 Dirham* is always 10
const COMMISSION_RATE = 2 / 1000; // 0.2% on combined base (when threshold not met)
const LYD_COMMISSION_THRESHOLD = 10_000; // If Amount_LYD < 10,000 => fixed 10 LYD commission
const FIXED_LYD_COMMISSION_UNDER_THRESHOLD = 10;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const toNumber = (v: unknown): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v.replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const nearlyEqual = (a: number, b: number, eps: number = 1e-6): boolean =>
  Math.abs(a - b) < eps;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const CheckRequestTable: React.FC<TCheckRequestTableProps> = ({ readOnly }) => {
  const t = useTranslations("CheckRequest");
  const { values, setFieldValue } = useFormikContext<FormShape>();

  /* Extract form values */
  const li0Dirham = values?.lineItems?.[0]?.dirham ?? "";
  const li1Dirham = values?.lineItems?.[1]?.dirham ?? "";
  const li2Dirham = values?.lineItems?.[2]?.dirham ?? "";

  const li0Lyd = values?.lineItems?.[0]?.lyd ?? "";
  const li1Lyd = values?.lineItems?.[1]?.lyd ?? "";
  const li2Lyd = values?.lineItems?.[2]?.lyd ?? "";

  /* Watch Amounts and compute Expenses + Totals
     Rules:
       - expenses.dirham = 10 (always)
       - expenses.lyd    = 
            if amount.lyd < 10000 → fixed 10
            else → (amount.lyd + amount.dirham/1000) * (2/1000)
       - total.dirham    = amount.dirham + 10
       - total.lyd       = amount.lyd + expenses.lyd
  */
  useEffect(() => {
    const amountDirham = toNumber(li0Dirham);
    const amountLyd = toNumber(li0Lyd);

    const fixedDirham = FIXED_DIRHAM_EXPENSE;

    const commissionLyd =
      amountLyd < LYD_COMMISSION_THRESHOLD
        ? FIXED_LYD_COMMISSION_UNDER_THRESHOLD
        : (amountLyd + amountDirham / 1000) * COMMISSION_RATE;

    const totalDirham = amountDirham + fixedDirham;
    const totalLyd = amountLyd + commissionLyd;

    const currentExpenseDirham =
      typeof li1Dirham === "number" ? li1Dirham : toNumber(li1Dirham);
    const currentExpenseLyd =
      typeof li1Lyd === "number" ? li1Lyd : toNumber(li1Lyd);

    const currentTotalDirham =
      typeof li2Dirham === "number" ? li2Dirham : toNumber(li2Dirham);
    const currentTotalLyd =
      typeof li2Lyd === "number" ? li2Lyd : toNumber(li2Lyd);

    if (!nearlyEqual(currentExpenseDirham, fixedDirham)) {
      void setFieldValue("lineItems[1].dirham", fixedDirham, false);
    }
    if (!nearlyEqual(currentExpenseLyd, commissionLyd)) {
      void setFieldValue("lineItems[1].lyd", commissionLyd, false);
    }
    if (!nearlyEqual(currentTotalDirham, totalDirham)) {
      void setFieldValue("lineItems[2].dirham", totalDirham, false);
    }
    if (!nearlyEqual(currentTotalLyd, totalLyd)) {
      void setFieldValue("lineItems[2].lyd", totalLyd, false);
    }
  }, [li0Dirham, li0Lyd, li1Dirham, li1Lyd, li2Dirham, li2Lyd, setFieldValue]);

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
        {/* Table Header (desktop / tablet) */}
        <div className="hidden grid-cols-3 bg-info-dark text-white sm:grid">
          <div className="px-4 py-3 text-center text-sm font-bold sm:text-base">
            &nbsp;
          </div>
          <div className="px-4 py-3 text-center text-sm font-bold sm:text-base">
            {t("dirham")} *
          </div>
          <div className="px-4 py-3 text-center text-sm font-bold sm:text-base">
            {t("lyd")} *
          </div>
        </div>

        {/* Row 1: Amount (user-editable) */}
        <div className="grid grid-cols-1 gap-3 border-b border-gray-200 sm:grid-cols-3 sm:gap-0">
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 sm:block sm:py-4">
            <span>{t("amount")}</span>
          </div>
          <div className="px-4 pb-2 sm:py-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 sm:hidden">
              {t("dirham")} *
            </span>
            <FormInputIcon
              name="lineItems[0].dirham"
              label=""
              type="text"
              startIcon={<FaMoneyBillWave />}
              width="w-full"
              disabled={readOnly}
            />
          </div>
          <div className="px-4 pb-3 sm:py-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 sm:hidden">
              {t("lyd")} *
            </span>
            <FormInputIcon
              name="lineItems[0].lyd"
              label=""
              type="text"
              startIcon={<FaMoneyBillWave />}
              width="w-full"
              disabled={readOnly}
            />
          </div>
        </div>

        {/* Row 2: Expenses (auto-calculated per rules above) */}
        <div className="grid grid-cols-1 gap-3 border-b border-gray-200 sm:grid-cols-3 sm:gap-0">
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 sm:block sm:py-4">
            <span>{t("expenses")}</span>
          </div>
          <div className="px-4 pb-2 sm:py-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 sm:hidden">
              {t("dirham")} *
            </span>
            <FormInputIcon
              name="lineItems[1].dirham"
              label=""
              type="text"
              startIcon={<FaMoneyBillWave />}
              width="w-full"
              disabled
            />
          </div>
          <div className="px-4 pb-3 sm:py-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 sm:hidden">
              {t("lyd")} *
            </span>
            <FormInputIcon
              name="lineItems[1].lyd"
              label=""
              type="text"
              startIcon={<FaMoneyBillWave />}
              width="w-full"
              disabled
            />
          </div>
        </div>

        {/* Row 3: Total Amount (auto-calculated) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-0">
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 sm:block sm:py-4">
            <span>{t("totalAmount")}</span>
          </div>
          <div className="px-4 pb-2 sm:py-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 sm:hidden">
              {t("dirham")} *
            </span>
            <FormInputIcon
              name="lineItems[2].dirham"
              label=""
              type="text"
              startIcon={<FaCalculator />}
              width="w-full"
              disabled
            />
          </div>
          <div className="px-4 pb-3 sm:py-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 sm:hidden">
              {t("lyd")} *
            </span>
            <FormInputIcon
              name="lineItems[2].lyd"
              label=""
              type="text"
              startIcon={<FaCalculator />}
              width="w-full"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Note about required amounts */}
      <div className="text-center text-sm text-gray-600">
        {t("amountNote")}
      </div>
    </div>
  );
};

export default CheckRequestTable;
