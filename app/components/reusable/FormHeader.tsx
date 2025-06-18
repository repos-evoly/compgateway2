// File: FormHeader.tsx
import React from "react";
import BackButton, { type BackButtonProps } from "./BackButton";

/**
 * Inherits every prop that <BackButton/> understands (e.g. `fallbackPath`, `isEditing`)
 * and adds layout-specific options for the header itself.
 */
export type FormHeaderProps = BackButtonProps & {
  /** Title text shown next to the Back button */
  text?: string;
  /** Extra content (typically buttons or switches) rendered on the right */
  children?: React.ReactNode;
  showBackButton?: boolean;
  className?: string;
  /** Makes the header sticky at the top of the scroll container */
  isFixedOnScroll?: boolean;
};

const FormHeader: React.FC<FormHeaderProps> = ({
  text,
  children,
  className = "",
  isFixedOnScroll = false,
  showBackButton,
  fallbackPath,
  isEditing,
  ...restBackButtonProps
}) => {
  /* ---------------- logic ---------------- */
  // Auto-display the Back button when navigation context exists
  const displayBackButton =
    showBackButton ?? (Boolean(fallbackPath) || Boolean(isEditing));

  // Left area is rendered only when we have either text or a Back button
  const hasLeftContent = displayBackButton || Boolean(text);

  return (
    <div
      className={`flex items-center bg-info-dark text-white p-4 rounded-md
        ${hasLeftContent && children ? "justify-between" : "justify-start"}
        ${isFixedOnScroll ? "sticky top-0 z-50" : ""}
        ${className}`}
    >
      {hasLeftContent && (
        <div className="flex items-center gap-2">
          {displayBackButton && (
            <BackButton
              fallbackPath={fallbackPath}
              isEditing={isEditing}
              {...restBackButtonProps}
            />
          )}
          {text && <h2 className="text-lg font-semibold">{text}</h2>}
        </div>
      )}

      {children && (
        <div className={`${!hasLeftContent ? "w-fit" : ""}`}>{children}</div>
      )}
    </div>
  );
};

export default FormHeader;
