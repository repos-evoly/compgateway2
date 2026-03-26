"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { IconType } from "react-icons";
import { formatAccountNumber } from "@/app/helpers/formatAccountNumber";

type InfoBoxProps = {
  title: string;
  icon: IconType;
  accountString: string;
  availableBalance: number | string;
  debitBalance: number | string;
};

const formatAmount = (value: number | string): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toLocaleString("en-US");
  }

  const raw = String(value).trim();
  if (!raw) return raw;

  const normalized = raw.replace(/,/g, "");
  const parsed = Number(normalized);
  if (Number.isFinite(parsed)) {
    return parsed.toLocaleString("en-US");
  }

  return raw;
};


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
        <span className="text-white font-medium px-2">{title}</span>
      </div>

      {/* Body */}
      <div className="p-2">
        {/* accountString */}
        <div className="mb-2 text-center">
          <p className="text-gray-600 font-medium">{t("accountNb")}</p>
          <p className="text-gray-800 text-base font-bold">
            {formatAccountNumber(accountString)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* availableBalance */}
          <div className="bg-white p-2 rounded shadow-sm text-center">
            <p className="text-gray-600 font-medium">{t("availableBalance")}</p>
            <p className="text-info-dark font-semibold">
              {formatAmount(availableBalance)}
            </p>
          </div>

          {/* debitBalance */}
          <div className="bg-white p-2 rounded shadow-sm text-center">
            <p className="text-gray-600 font-medium">{t("debitBalance")}</p>
            <p className="text-info-dark font-semibold">
              {formatAmount(debitBalance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
