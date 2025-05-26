import React, { JSX } from "react";
import { useFormikContext } from "formik";
import { FC } from "react";
import { FaSpinner } from "react-icons/fa"; // spinner icon

type SubmitButtonPropsType = {
  title: string;
  Icon?: FC<React.SVGProps<SVGSVGElement>>; // Make Icon optional
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
    | "secondary-dark";
  fullWidth?: boolean;
  adminOff?: boolean;
  isSubmitting?: boolean; // pass as a prop to display spinner
  disabled?: boolean; // NEW prop for forced disable
};

const SubmitButton = ({
  title,
  Icon,
  color = "success-main", // default color
  fullWidth = true,
  adminOff = false,
  isSubmitting = false,
  disabled = false,
}: SubmitButtonPropsType): JSX.Element => {
  const { handleSubmit } = useFormikContext();

  const handleClick = () => {
    handleSubmit();
  };

  // Map color prop to Tailwind classes
  const colorClass = `bg-${color} hover:bg-opacity-90 text-white`;

  // Combine all disable conditions
  const isButtonDisabled = isSubmitting || adminOff || disabled;

  // If disabled, omit hover classes altogether
  const buttonClass = isButtonDisabled
    ? "bg-gray-300 text-gray-500 cursor-not-allowed border-white"
    : `border border-white hover:border-transparent hover:bg-warning-light hover:text-info-dark ${colorClass}`;

  return (
    <div
      className={`flex ${
        fullWidth ? "w-full" : "w-auto"
      } items-center justify-center`}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={isButtonDisabled}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition duration-300 ${buttonClass}`}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <FaSpinner className="animate-spin h-5 w-5" />
            <span>Submitting...</span>
          </span>
        ) : (
          <>
            {title}
            {Icon && <Icon className="h-5 w-5" />}
          </>
        )}
      </button>
    </div>
  );
};

export default SubmitButton;
