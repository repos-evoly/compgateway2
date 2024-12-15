"use client";

import React from "react";
import Image from "next/image";
import { MainHeaderProps } from "@/types";
import { useTranslations } from "next-intl";
import { useGlobalContext } from "../../context/GlobalContext";

const MainHeader: React.FC<MainHeaderProps> = ({ logoUrl, isRtl }) => {
  const t = useTranslations("sidebarItems");
  const { headerTitleLabel } = useGlobalContext();

  return (
    <header className="w-full h-20 flex items-center px-8 bg-info-main text-info-dark">
      <div
        className={`flex-shrink-0 ${
          isRtl ? "order-2 ml-auto" : "order-0 mr-auto"
        } ${isRtl ? "scale-x-[-1]" : ""}`}
      >
        <Image
          src={logoUrl}
          alt="Logo"
          width={60} // Adjust width
          height={60} // Adjust height
        />
      </div>
      {/* Translate the label dynamically */}
      <h1 className="flex-1 text-center text-xl font-bold">
        {t(headerTitleLabel)}
      </h1>
    </header>
  );
};

export default MainHeader;
