"use client";

import React from "react";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import { FaMoneyBillWave, FaCalculator } from "react-icons/fa";
import { useTranslations } from "next-intl";

type TCheckRequestTableProps = {
  /** If true, inputs are disabled */
  readOnly?: boolean;
};

const CheckRequestTable: React.FC<TCheckRequestTableProps> = ({ readOnly }) => {
  const t = useTranslations("CheckRequest");

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 rounded-lg">
      <div className="w-full max-w-5xl border border-gray-300 rounded-lg">
        {/* Table Header */}
        <div className="grid grid-cols-3 bg-info-dark text-white rounded-t-lg">
          <div className="p-4 text-center font-bold">&nbsp;</div>
          <div className="p-4 text-center font-bold">{t("dirham")}</div>
          <div className="p-4 text-center font-bold">{t("lyd")}</div>
        </div>

        {/* Row 1: Amount */}
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
              disabled={readOnly} // Disable if readOnly
            />
          </div>
          <div className="p-4">
            <FormInputIcon
              name="lineItems[0].lyd"
              label=""
              type="text"
              startIcon={<FaMoneyBillWave />}
              width="w-full"
              disabled={readOnly} // Disable if readOnly
            />
          </div>
        </div>

        {/* Row 2: Expenses */}
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
              disabled={readOnly}
            />
          </div>
          <div className="p-4">
            <FormInputIcon
              name="lineItems[1].lyd"
              label=""
              type="text"
              startIcon={<FaMoneyBillWave />}
              width="w-full"
              disabled={readOnly}
            />
          </div>
        </div>

        {/* Row 3: Total Amount */}
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
              disabled={readOnly}
            />
          </div>
          <div className="p-4">
            <FormInputIcon
              name="lineItems[2].lyd"
              label=""
              type="text"
              startIcon={<FaCalculator />}
              width="w-full"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckRequestTable;
