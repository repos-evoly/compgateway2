"use client";
import React from "react";
import { FC } from "react";

type AuthHeaderProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
};

const AuthHeader: FC<AuthHeaderProps> = ({ icon, title, subtitle }) => {
  return (
    <header className="w-[97%] mx-auto h-28 flex items-center px-8 bg-info-main text-info-dark shadow-md rounded-lg">
      <div className="w-full flex items-center justify-end gap-4">
        {/* Title & Subtitle Section */}
        <div className="flex flex-col text-right">
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-info-dark">{subtitle}</p>}
        </div>

        {/* Icon Section */}
        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white text-info-dark text-3xl shadow-lg">
          {icon}
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
