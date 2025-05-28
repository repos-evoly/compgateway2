"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { IconType } from "react-icons";

type InfoBoxProps = {
  title: string;
  icon: IconType;
  accountString: string;
  availableBalance: number;
  debitBalance: number;
};

/**
 * A reusable box that displays:
 * - A header with an icon and title
 * - The accountString
 * - availableBalance
 * - debitBalance
 */
export default function InfoBox({
  title,
  icon: Icon,
  accountString,
  availableBalance,
  debitBalance,
}: InfoBoxProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="bg-info-main rounded shadow-sm overflow-hidden text-sm">
      {/* Header */}
      <div className="bg-info-dark p-2 flex items-center">
        <Icon className="text-white text-base mr-2" />
        <span className="text-white font-medium">{title}</span>
      </div>

      {/* Body */}
      <div className="p-2">
        {/* accountString */}
        <div className="mb-2 text-center">
          <p className="text-gray-600 font-medium">{t("accountNb")}</p>
          <p className="text-gray-800 text-base font-bold">{accountString}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* availableBalance */}
          <div className="bg-white p-2 rounded shadow-sm text-center">
            <p className="text-gray-600 font-medium">{t("availableBalance")}</p>
            <p className="text-info-dark font-semibold">
              {availableBalance.toLocaleString()}
            </p>
          </div>

          {/* debitBalance */}
          <div className="bg-white p-2 rounded shadow-sm text-center">
            <p className="text-gray-600 font-medium">{t("debitBalance")}</p>
            <p className="text-info-dark font-semibold">
              {debitBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
