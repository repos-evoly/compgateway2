"use client";

import React, { JSX, useEffect, useState } from "react";
import { CheckAccount } from "@/app/helpers/checkAccount";
import type { AccountInfo } from "@/app/helpers/checkAccount";

// Example icons
import {
  FiInfo,
  FiDollarSign,
  FiCreditCard,
  FiBarChart2,
} from "react-icons/fi";
import { MdError } from "react-icons/md";

// Our new InfoBox component
import InfoBox from "./components/InfoBox";

export default function DashboardPage(): JSX.Element {
  const [accountData, setAccountData] = useState<AccountInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  if (loading) {
    console.log("loading", loading);
  }

  useEffect(() => {
    (async () => {
      try {
        const data = await CheckAccount("549117");
        setAccountData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="p-3">
        <div className="bg-red-600 text-white p-3 rounded shadow-md">
          <div className="flex items-center mb-2">
            <MdError className="text-xl mr-2" />
            <p className="font-bold text-sm">Failed to fetch account data:</p>
          </div>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!accountData || accountData.length === 0) {
    return (
      <div className="p-3">
        <div className="bg-info-dark text-white p-3 rounded shadow-md flex items-center">
          <FiInfo className="text-xl mr-2" />
          <p className="font-bold text-sm">No account data found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accountData.map((acc, index) => {
          // Decide which icon to use for each box
          let BoxIcon = FiInfo;
          if (index === 0) BoxIcon = FiDollarSign;
          if (index === 1) BoxIcon = FiCreditCard;
          if (index === 2) BoxIcon = FiBarChart2;

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
    </div>
  );
}
