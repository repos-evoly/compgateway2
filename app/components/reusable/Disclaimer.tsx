"use client";

import React from "react";
import { FiInfo } from "react-icons/fi";

type DisclaimerProps = {
  message: React.ReactNode;
  className?: string;
};

const Disclaimer: React.FC<DisclaimerProps> = ({ message, className = "" }) => {
  return (
    <div
      role="note"
      className={`flex items-start gap-2 rounded-md border border-info-dark/30 bg-warning-light px-3 py-2 text-sm text-info-dark ${className}`}
    >
      <FiInfo className="mt-0.5 shrink-0 text-base" aria-hidden />
      <div className="leading-6">{message}</div>
    </div>
  );
};

export default Disclaimer;
