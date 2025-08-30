/* --------------------------------------------------------------------------
   app/[locale]/requests/checkRequest/components/Table.tsx
   – Client component
   – Fetches commission config (B2C) using servicePackageId from cookies.
   – When the user types an Amount (row 1) in either column:
       • Expenses (row 2) = max(amount * pct/100, fixed fee)
       • Total (row 3)    = amount + expenses
     Computation happens via Formik value watchers (no changes to FormInputIcon).
   – Strict TypeScript (no `any`), copy-paste ready.
   -------------------------------------------------------------------------- */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import { useFormikContext } from "formik";
import { FaMoneyBillWave, FaCalculator } from "react-icons/fa";

import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import { getTransfersCommision } from "@/app/[locale]/transfers/internal/services";
import type { TransfersCommision } from "@/app/[locale]/transfers/internal/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type LineItem = {
  dirham: number | "";
  lyd: number | "";
};

type FormShape = {
  lineItems: [LineItem, LineItem, LineItem]; // [Amount, Expenses, Total]
};

type TCheckRequestTableProps = {
  /** If true, inputs are disabled */
  readOnly?: boolean;
};

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const COOKIE_KEY: string = "servicePackageId";
const TRANSACTION_CATEGORY_ID: number = 5;

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

const computeCommission = (
  amount: number,
  pct: number,
  fixed: number
): number => Math.max((amount * pct) / 100, fixed);

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const CheckRequestTable: React.FC<TCheckRequestTableProps> = ({ readOnly }) => {
  const t = useTranslations("CheckRequest");
  const { values, setFieldValue } = useFormikContext<FormShape>();

  const [comm, setComm] = useState<TransfersCommision | null>(null);

  /* Fetch commission config once */
  useEffect(() => {
    const run = async (): Promise<void> => {
      const rawId = Cookies.get(COOKIE_KEY);
      const parsed = rawId ? Number(rawId) : NaN;
      if (!Number.isFinite(parsed)) {
        console.error(
          `Cookie "${COOKIE_KEY}" is missing or not a valid number. Got:`,
          rawId
        );
        return;
      }
      try {
        const data = await getTransfersCommision(
          parsed,
          TRANSACTION_CATEGORY_ID
        );
        setComm(data);
      } catch (err) {
        console.error("[Transfers Commission] Fetch failed:", err);
      }
    };
    void run();
  }, []);

  const pct = useMemo<number>(() => comm?.b2CCommissionPct ?? 0, [comm]);
  const fixed = useMemo<number>(() => comm?.b2CFixedFee ?? 0, [comm]);

  /* Extract watched form values into simple variables to satisfy exhaustive-deps */
  const li0Dirham = values?.lineItems?.[0]?.dirham ?? "";
  const li1Dirham = values?.lineItems?.[1]?.dirham ?? "";
  const li2Dirham = values?.lineItems?.[2]?.dirham ?? "";

  const li0Lyd = values?.lineItems?.[0]?.lyd ?? "";
  const li1Lyd = values?.lineItems?.[1]?.lyd ?? "";
  const li2Lyd = values?.lineItems?.[2]?.lyd ?? "";

  /* Watch Amount (Dirham) and auto-fill Expenses & Total */
  useEffect(() => {
    if (readOnly) return;
    if (!comm) return;

    const amount = toNumber(li0Dirham);
    const expense = computeCommission(amount, pct, fixed);
    const total = amount + expense;

    const currentExpense =
      typeof li1Dirham === "number" ? li1Dirham : toNumber(li1Dirham);
    const currentTotal =
      typeof li2Dirham === "number" ? li2Dirham : toNumber(li2Dirham);

    const needsExpenseUpdate = currentExpense !== expense;
    const needsTotalUpdate = currentTotal !== total;

    if (needsExpenseUpdate) {
      void setFieldValue("lineItems[1].dirham", expense);
    }
    if (needsTotalUpdate) {
      void setFieldValue("lineItems[2].dirham", total);
    }
  }, [
    readOnly,
    comm,
    pct,
    fixed,
    li0Dirham,
    li1Dirham,
    li2Dirham,
    setFieldValue,
  ]);

  /* Watch Amount (LYD) and auto-fill Expenses & Total */
  useEffect(() => {
    if (readOnly) return;
    if (!comm) return;

    const amount = toNumber(li0Lyd);
    const expense = computeCommission(amount, pct, fixed);
    const total = amount + expense;

    const currentExpense =
      typeof li1Lyd === "number" ? li1Lyd : toNumber(li1Lyd);
    const currentTotal = typeof li2Lyd === "number" ? li2Lyd : toNumber(li2Lyd);

    const needsExpenseUpdate = currentExpense !== expense;
    const needsTotalUpdate = currentTotal !== total;

    if (needsExpenseUpdate) {
      void setFieldValue("lineItems[1].lyd", expense);
    }
    if (needsTotalUpdate) {
      void setFieldValue("lineItems[2].lyd", total);
    }
  }, [readOnly, comm, pct, fixed, li0Lyd, li1Lyd, li2Lyd, setFieldValue]);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 rounded-lg">
      <div className="w-full max-w-5xl border border-gray-300 rounded-lg">
        {/* Table Header */}
        <div className="grid grid-cols-3 bg-info-dark text-white rounded-t-lg">
          <div className="p-4 text-center font-bold">&nbsp;</div>
          <div className="p-4 text-center font-bold">{t("dirham")} *</div>
          <div className="p-4 text-center font-bold">{t("lyd")} *</div>
        </div>

        {/* Row 1: Amount (user-editable) */}
        <div className="grid grid-cols-3 border-b border-gray-300">
          <div className="p-4 bg-gray-100 font-semibold text-gray-700">
            {t("amount")}
          </div>
          <div className="p-4">
            <FormInputIcon
              name="lineItems[0].dirham"
              label=""
              type="text"
              startIcon={<FaMoneyBillWave />}
              width="w-full"
              disabled={readOnly}
            />
          </div>
          <div className="p-4">
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

        {/* Row 2: Expenses (auto-calculated) */}
        <div className="grid grid-cols-3 border-b border-gray-300">
          <div className="p-4 bg-gray-100 font-semibold text-gray-700">
            {t("expenses")}
          </div>
          <div className="p-4">
            <FormInputIcon
              name="lineItems[1].dirham"
              label=""
              type="text"
              startIcon={<FaMoneyBillWave />}
              width="w-full"
              disabled
            />
          </div>
          <div className="p-4">
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
        <div className="grid grid-cols-3">
          <div className="p-4 bg-gray-100 font-semibold text-gray-700">
            {t("totalAmount")}
          </div>
          <div className="p-4">
            <FormInputIcon
              name="lineItems[2].dirham"
              label=""
              type="text"
              startIcon={<FaCalculator />}
              width="w-full"
              disabled
            />
          </div>
          <div className="p-4">
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
      <div className="mt-4 text-center text-sm text-gray-600">
        {t("amountNote")}
      </div>
    </div>
  );
};

export default CheckRequestTable;
