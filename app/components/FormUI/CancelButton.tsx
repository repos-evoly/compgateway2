// components/FormUI/CancelButton.tsx
"use client";

import React, { FC } from "react";

export type CancelButtonProps = {
  /** Button text */
  title?: string;
  /** Click handler */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** If true, button will stretch full-width */
  fullWidth?: boolean;
  /** Optional icon to render before the title */
  Icon?: FC<React.SVGProps<SVGSVGElement>>;
};

const CancelButton: FC<CancelButtonProps> = ({
  title = "Cancel",
  onClick,
  disabled = false,
  fullWidth = false,
  Icon,
}) => {
  const baseClasses =
    "flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition duration-300";
  const sizeClass = fullWidth ? "w-full" : "w-auto";
  const stateClasses = disabled
    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
    : "bg-info-dark text-white hover:bg-warning-light hover:text-info-dark";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClass} ${stateClasses}`}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {title}
    </button>
  );
};

export default CancelButton;
