/* app/dashboard/components/StatsBox.tsx */
"use client";

import React from "react";
import type { IconType } from "react-icons";

type Props = {
  label: string;
  value: string | number;
  Icon: IconType;
};

const StatsBox: React.FC<Props> = ({ label, value, Icon }) => (
  <div className="flex items-center gap-4 p-4 rounded-lg bg-white shadow-sm border">
    {/* Icon bubble */}
    <div className="p-3 rounded-full bg-info-dark/10 text-info-dark">
      <Icon className="w-6 h-6" />
    </div>

    {/* Numbers + label */}
    <div>
      <p className="text-sm text-gray-500 rtl:text-right">{label}</p>
      <p className="text-lg font-semibold text-gray-900 rtl:text-right">
        {value}
      </p>
    </div>
  </div>
);

export default StatsBox;
