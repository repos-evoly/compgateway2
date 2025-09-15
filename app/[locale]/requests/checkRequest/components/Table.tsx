/* --------------------------------------------------------------------------
   app/[locale]/requests/checkRequest/components/Table.tsx
   – Client component
   – Row 1 (Amount): user enters values.
   – Row 2 (Expenses): 
       • Dirham *  = fixed **10** (always)
       • D.L *     = (Amount_LYD + Amount_Dirham/1000) × (2/1000)
         (i.e., 1 د.ل* = 1000 درهم*)
   – Row 3 (Total):
       • Dirham *  = Amount_Dirham + 10
       • D.L *     = Amount_LYD + computed commission (2/1000 on combined)
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
       - expenses.dirham = 10
       - expenses.lyd    = (amount.lyd + amount.dirham/1000) * (2/1000)
       - total.dirham    = amount.dirham + 10
       - total.lyd       = amount.lyd + expenses.lyd
  */
  useEffect(() => {
    const amountDirham = toNumber(li0Dirham);
    const amountLyd = toNumber(li0Lyd);

    const fixedDirham = 10;
    const commissionLyd = (amountLyd + amountDirham / 1000) * (2 / 1000);

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

        {/* Row 2: Expenses (auto-calculated per rules above) */}
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
