import React from "react";

type Props = {
  text: string;
  color?: "success" | "warning" | "primary" | "info";
};

const DividerWrapper = ({ text, color = "primary" }: Props) => {
  // Tailwind classes for different colors
  const colorClasses = {
    success: "bg-green-500 text-white",
    warning: "bg-yellow-500 text-white",
    primary: "bg-blue-500 text-white",
    info: "bg-teal-500 text-white",
  };

  return (
    <div className="flex items-center my-4">
      {/* Line on the left */}
      <div className="flex-grow border-t border-gray-300"></div>
      {/* Chip-like text */}
      {text && (
        <span
          className={`mx-4 px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`}
        >
          {text}
        </span>
      )}
      {/* Line on the right */}
      <div className="flex-grow border-t border-gray-300"></div>
    </div>
  );
};

export default DividerWrapper;
