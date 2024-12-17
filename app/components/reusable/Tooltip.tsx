import React, { ReactNode, useState } from "react";

type TooltipProps = {
  children: ReactNode; // The wrapped element
  tooltip: string; // Tooltip text
  position?: "top" | "bottom" | "left" | "right"; // Optional positioning
};

const Tooltip: React.FC<TooltipProps> = ({
  children,
  tooltip,
  position = "top",
}) => {
  const [visible, setVisible] = useState(false);

  const positionClass = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Tooltip */}
      {visible && (
        <div
          className={`absolute z-10 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${positionClass[position]} transition-opacity duration-300`}
        >
          {tooltip}
        </div>
      )}

      {/* Wrapped Content */}
      <div
        className="cursor-pointer"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
    </div>
  );
};

export default Tooltip;
