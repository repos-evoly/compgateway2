import React from "react";
import BackButton from "./BackButton";

type FormHeaderProps = {
  text?: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
  className?: string;
  /** If true, the header will be sticky at the top of the scrolling area */
  isFixedOnScroll?: boolean;
};

const FormHeader: React.FC<FormHeaderProps> = ({
  text,
  children,
  showBackButton,
  className = "",
  isFixedOnScroll = false,
}) => {
  // Check if both text and back button are missing
  const hasLeftContent = showBackButton || text;

  return (
    <div
      className={`
        flex items-center bg-info-dark text-white p-4 rounded-md 
        ${hasLeftContent && children ? "justify-between" : "justify-start"}
        ${className}
        ${isFixedOnScroll ? "sticky top-0 z-50" : ""}
      `}
    >
      {/* Only render the left side container if there is content for it */}
      {hasLeftContent && (
        <div className="flex items-center gap-2">
          {showBackButton && <BackButton />}
          {text && <h2 className="text-lg font-semibold">{text}</h2>}
        </div>
      )}

      {/* Children will take full width if no left content */}
      {children && (
        <div className={`${!hasLeftContent ? "w-fit" : ""}`}>{children}</div>
      )}
    </div>
  );
};

export default FormHeader;
