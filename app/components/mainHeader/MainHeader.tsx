"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { MainHeaderProps } from "@/types";

const MainHeader: React.FC<MainHeaderProps> = ({ logoUrl, isRtl }) => {
  const t = useTranslations("sidebarItems");
  const d = useTranslations("descriptions");
  const { headerInfo } = useGlobalContext();

  return (
    <header className="w-full md:h-24 py-4 md:py-0 flex items-center px-4 md:px-8 bg-info-main text-info-dark shadow-md">
      {/* 
        On mobile, use column layout with proper spacing
        On desktop, maintain the original layout
      */}
      <div className="w-full flex flex-col  items-center md:justify-between md:flex-row-reverse">
        {/* Logo - centered on mobile, right side on desktop */}
        <div className="flex-shrink-0 mb-4 md:mb-0">
          <Image src={logoUrl} alt="Logo" width={60} height={60} />
        </div>

        {/* Header Info + Icon - Full width on mobile */}
        <div
          className={`flex items-center ${
            isRtl ? "text-right" : "text-left"
          } w-full md:w-auto`}
        >
          {headerInfo.icon && (
            <div
              className={`flex items-center justify-center min-w-[4rem] h-16 rounded-lg 
                          bg-white text-info-dark text-3xl shadow-lg 
                          ${isRtl ? "ml-4" : "mr-4"}`}
            >
              {headerInfo.icon}
            </div>
          )}
          <div className="flex-1 md:flex-auto">
            <span className="text-xl font-bold">{t(headerInfo.label)}</span>
            {headerInfo.description && (
              <p className="text-sm text-info-dark break-words">
                {d(headerInfo.description)}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
