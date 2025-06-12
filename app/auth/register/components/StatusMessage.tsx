"use client";

import React from "react";
import { IoWarning } from "react-icons/io5";

type TStatusMessageProps = {
  message: string;
};

export default function StatusMessage({ message }: TStatusMessageProps) {
  return (
    <div
      dir="rtl"
      className="mt-2 relative w-4/5 mx-auto overflow-hidden bg-warning-light border-r-4 border-warning-main rounded-lg shadow-sm mb-6 group hover:shadow-md transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 w-full h-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>

      <div className="relative flex items-start p-3">
        {/* Icon sits on the right in RTL (first in the flex row) */}
        <div className="flex-shrink-0 mr-3">
          <div className="w-5 h-5 bg-warning-main rounded-full flex items-center justify-center shadow-sm">
            <IoWarning className="w-3 h-3 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-gray-800 text-sm font-medium leading-snug">
            {message}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-l from-orange-400 via-red-500 to-orange-400 opacity-70"></div>
    </div>
  );
}
