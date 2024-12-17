import React, { FC, JSX } from "react";
import { useFormikContext } from "formik";

type ResetButtonPropsType = {
  title: string;
  Icon: FC<React.SVGProps<SVGSVGElement>>; // Use React's built-in SVGProps
  color?:
    | "success-main"
    | "success-light"
    | "success-dark"
    | "warning-main"
    | "warning-light"
    | "info-main"
    | "info-light"
    | "info-dark"
    | "error-main"
    | "secondary-main"
    | "secondary-light"
    | "secondary-dark"; // Tailwind dynamic colors
  fullWidth?: boolean;
  adminOff?: boolean;
};

const ResetButton = ({
  title,
  Icon,
  color = "error-main", // Default Tailwind color for reset
  fullWidth = false,
  adminOff = false,
}: ResetButtonPropsType): JSX.Element => {
  const { resetForm } = useFormikContext();

  const handleClick = () => {
    resetForm(); // Reset all form fields
  };

  // Map Tailwind colors
  const colorClasses = {
    "success-main": "bg-success-main hover:bg-success-dark text-white",
    "success-light": "bg-success-light hover:bg-success-main text-white",
    "success-dark": "bg-success-dark hover:bg-success-main text-white",
    "warning-main": "bg-warning-main hover:bg-warning-light text-black",
    "warning-light": "bg-warning-light hover:bg-warning-main text-black",
    "info-main": "bg-info-main hover:bg-info-dark text-white",
    "info-light": "bg-info-light hover:bg-info-main text-white",
    "info-dark": "bg-info-dark hover:bg-info-main text-white",
    "error-main": "bg-error-main hover:bg-error-main text-white",
    "secondary-main": "bg-secondary-main hover:bg-secondary-dark text-white",
    "secondary-light": "bg-secondary-light hover:bg-secondary-main text-white",
    "secondary-dark": "bg-secondary-dark hover:bg-secondary-main text-white",
  };

  return (
    <div
      className={`flex ${
        fullWidth ? "w-full" : "w-auto"
      } items-center justify-center`}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={adminOff}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition duration-300 ${
          adminOff
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : colorClasses[color]
        }`}
      >
        {title}
        <Icon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ResetButton;
