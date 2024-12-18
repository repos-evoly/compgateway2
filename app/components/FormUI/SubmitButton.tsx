import React, { JSX } from "react";
import { useFormikContext } from "formik";
import { FC } from "react";
import { FaSpinner } from "react-icons/fa"; // Import the spinner icon

type SubmitButtonPropsType = {
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
  isSubmitting?: boolean; // Pass as a prop to control submitting state
};

const SubmitButton = ({
  title,
  Icon,
  color = "success-main", // Default to 'success-main'
  fullWidth = true,
  adminOff = false,
  isSubmitting = false,
}: SubmitButtonPropsType): JSX.Element => {
  const { handleSubmit } = useFormikContext();

  const handleClick = () => {
    handleSubmit();
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
        type="submit"
        onClick={handleClick}
        disabled={isSubmitting || adminOff}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition duration-300 ${
          isSubmitting || adminOff
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : colorClass
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <FaSpinner className="animate-spin h-5 w-5" />
            <span>Submitting...</span>
          </span>
        ) : (
          <>
            {title}
            <Icon className="h-5 w-5" />
          </>
        )}
      </button>
    </div>
  );
};

export default SubmitButton;
