import React from "react";

type LinkButtonProps = {
  lng?: "ar" | "en"; // Optional language prop for RTL/LTR
  disabled?: boolean; // Disabled state
  children: React.ReactNode; // Button content
  onClick?: () => void; // Click handler
};

const LinkButton = ({
  lng = "en",
  disabled = false,
  children,
  onClick,
}: LinkButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`mt-2 font-bold underline text-primary cursor-pointer p-2 ${
        lng === "ar" ? "rtl" : "ltr"
      } ${
        disabled ? "cursor-not-allowed text-gray-400" : "hover:no-underline"
      }`}
    >
      {children}
    </button>
  );
};

export default LinkButton;
