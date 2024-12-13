import React from "react";
import Image from "next/image";
import { MainHeaderProps } from "@/types"; // Assuming you have your types defined in "@/types"
import { useTranslations } from "next-intl";

const MainHeader: React.FC<MainHeaderProps> = ({ logoUrl, isRtl }) => {
  const t = useTranslations("mainHeader");

  return (
    <header className="w-full h-28 flex items-center px-8 bg-info-dark text-white">
      <div
        className={`flex-shrink-0 ${
          isRtl ? "order-2 ml-auto" : "order-0 mr-auto"
        } ${isRtl ? "scale-x-[-1]" : ""}`}
      >
        <Image
          src={logoUrl}
          alt="Logo"
          width={72} // Increased width
          height={72} // Increased height
        />
      </div>
      <h1 className="flex-1 text-center text-xl font-bold">{t("title")}</h1>
    </header>
  );
};

export default MainHeader;
