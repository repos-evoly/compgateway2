import React, { JSX } from "react";
import { useFormikContext } from "formik";
import { FC } from "react";

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
    | "secondary-dark"; // Define Tailwind dynamic colors
  fullWidth?: boolean;
  adminOff?: boolean;
};

const ResetButton = ({
  title,
  Icon,
  color = "error-main", // Default to 'error-main'
  fullWidth = true,
  adminOff = false,
}: ResetButtonPropsType): JSX.Element => {
  const { resetForm } = useFormikContext();

  const handleClick = () => {
    resetForm(); // Clear all form fields
  };

  // Map color prop to dynamic Tailwind color class
  const colorClass = `bg-${color} hover:bg-opacity-90 text-white`;

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
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition duration-300 text-white ${
          adminOff
            ? "bg-warning-light text-gray-500 cursor-not-allowed"
            : colorClass
        }`}
      >
        <>
          {title}
          <Icon className="h-5 w-5" />
        </>
      </button>
    </div>
  );
};

export default ResetButton;
