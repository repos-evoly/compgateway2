"use client";
import React from "react";
import Image from "next/image";
import { MainHeaderProps } from "@/types";
import { useTranslations } from "next-intl";
import { useGlobalContext } from "../../context/GlobalContext";

const MainHeader: React.FC<MainHeaderProps> = ({ logoUrl }) => {
  const t = useTranslations("sidebarItems");
  const { headerInfo } = useGlobalContext();

  return (
    <header className="w-full h-28 flex items-center px-8 bg-info-main text-info-dark shadow-md">
      {/* Container for both logo and header info */}
      <div className="w-full flex items-center rtl:flex-row-reverse ltr:flex-row">
        {/* Logo Section */}
        <div className="flex-shrink-0 rtl:order-1 ltr:order-2 rtl:scale-x-[-1]">
          <Image src={logoUrl} alt="Logo" width={60} height={60} />
        </div>

        {/* Header Info Section */}
        <div className="flex-1 flex items-center rtl:order-2 ltr:order-1 rtl:justify-start">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Icon Box */}
            {headerInfo.icon && (
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white text-info-dark text-3xl shadow-lg">
                {headerInfo.icon}
              </div>
            )}
            {/* Translated Text */}
            <span className="text-xl font-bold">{t(headerInfo.label)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
