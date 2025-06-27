/* A refined full-screen loading page using Tailwind only */
"use client";

import React, { JSX } from "react";
import Image from "next/image";
import { FiLoader } from "react-icons/fi";

type LoadingPageProps = {
  /** Optional brand logo */
  logoSrc?: string;
};

export default function LoadingPage({
  logoSrc = "/images/logo-trans.png",
}: LoadingPageProps): JSX.Element {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white via-slate-100 to-slate-200">
      {/* glassy card */}
      <div className="flex w-80 flex-col items-center gap-6 rounded-2xl bg-white/70 p-8 shadow-xl backdrop-blur">
        {/* logo (decorative) */}
        <Image
          src={logoSrc}
          alt=""
          width={72}
          height={72}
          className="select-none"
          priority
        />

        {/* spinner */}
        <div
          role="status"
          aria-live="polite"
          aria-label="جارٍ التحميل"
          className="flex flex-col items-center gap-2"
        >
          <FiLoader className="h-10 w-10 animate-spin text-info-dark" />
          <span className="text-sm font-medium text-info-dark">
            يرجى الانتظار…
          </span>
        </div>

        {/* shimmer progress bar (pulse only) */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-300/60">
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-info-light via-info-dark to-info-light animate-pulse" />
        </div>
      </div>
    </div>
  );
}
